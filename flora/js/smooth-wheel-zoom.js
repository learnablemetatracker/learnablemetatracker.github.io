(function (L) {
  'use strict';

  const ZOOM_PER_WHEEL_PIXEL = 0.0045;
  const EASING = 0.4;
  const IDLE_MS = 100;
  const EPSILON = 0.002;

  L.Map.mergeOptions({ smoothWheelZoom: false, smoothWheelSensitivity: 1 });

  L.Map.SmoothWheelZoom = L.Handler.extend({
    addHooks() {
      L.DomEvent.on(this._map.getContainer(), 'wheel', this._onWheel, this);
    },

    removeHooks() {
      L.DomEvent.off(this._map.getContainer(), 'wheel', this._onWheel, this);
      this.stop();
    },

    stop() {
      cancelAnimationFrame(this._frame);
      clearTimeout(this._idleTimer);
      this._frame = null;
      this._active = false;
      this._idle = false;
      if (this._moving) {
        this._map.fire('viewreset');
        this._map._moveEnd(true);
      }
      this._moving = false;
    },

    _onWheel(event) {
      L.DomEvent.stop(event);
      const map = this._map;
      if (!this._active) {
        map._stop();
        this._targetZoom = map.getZoom();
        this._active = true;
        this._moving = false;
      }

      this._point = map.mouseEventToContainerPoint(event);
      this._anchor = map.containerPointToLatLng(this._point);
      const change = L.DomEvent.getWheelDelta(event) * ZOOM_PER_WHEEL_PIXEL * map.options.smoothWheelSensitivity;
      this._targetZoom = map._limitZoom(this._targetZoom + Math.max(-2, Math.min(2, change)));
      this._idle = false;
      clearTimeout(this._idleTimer);
      this._idleTimer = setTimeout(() => { this._idle = true; }, IDLE_MS);
      if (!this._frame) this._frame = requestAnimationFrame(this._tick.bind(this));
    },

    _tick() {
      this._frame = null;
      if (!this._active) return;

      const map = this._map;
      const current = map.getZoom();
      const difference = this._targetZoom - current;
      const next = Math.abs(difference) <= EPSILON ? this._targetZoom : current + difference * EASING;

      if (next !== current) {
        const offset = this._point.subtract(map.getSize().divideBy(2));
        const center = map.unproject(map.project(this._anchor, next).subtract(offset), next);
        if (!this._moving) {
          map._moveStart(true, false);
          this._moving = true;
        }
        map._move(center, next, { pinch: true, round: false });
      }

      if (this._idle && Math.abs(this._targetZoom - map.getZoom()) <= EPSILON) {
        this.stop();
      } else {
        this._frame = requestAnimationFrame(this._tick.bind(this));
      }
    },
  });

  L.Map.addInitHook('addHandler', 'smoothWheelZoom', L.Map.SmoothWheelZoom);
})(L);
