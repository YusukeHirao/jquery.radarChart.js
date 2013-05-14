// Generated by CoffeeScript 1.6.2
/*
* jquery.radarChart.js
* Author: Yusuke Hirao [http://www.yusukehirao.com]
* Version: 0.1.2.0
* Github: https://github.com/YusukeHirao/jquery.radarChart.js
* Licensed under the MIT License
* Require: jQuery v@1.9.1
*/


(function() {
  'use strict';
  var $, Polygon, debug, w;

  w = this;

  $ = w.jQuery;

  debug = function(obj) {
    var k, res, v;

    res = [];
    for (k in obj) {
      v = obj[k];
      res.push("" + k + ": " + v);
    }
    return res.join('\n');
  };

  Polygon = (function() {
    Polygon.prototype.ctx = null;

    Polygon.prototype.sides = 3;

    Polygon.prototype.interiorAngle = 0;

    Polygon.prototype.x = 0;

    Polygon.prototype.y = 0;

    Polygon.prototype.radius = 100;

    Polygon.prototype.rotate = 270;

    Polygon.prototype.strokeStyle = '#000';

    Polygon.prototype.lineWidth = 1;

    Polygon.prototype.fillStyle = 'none';

    function Polygon(ctx, sides, radius, x, y) {
      this.ctx = ctx;
      this.sides = sides != null ? sides : 3;
      this.radius = radius != null ? radius : 100;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.interiorAngle = Math.PI * 2 / this.sides;
    }

    Polygon.prototype.peint = function() {
      var apex, apexes, ctx, i, _i, _len;

      ctx = this.ctx;
      ctx.beginPath();
      apexes = this.getApexes();
      for (i = _i = 0, _len = apexes.length; _i < _len; i = ++_i) {
        apex = apexes[i];
        if (i === 0) {
          ctx.moveTo(apex[0], apex[1]);
        } else {
          ctx.lineTo(apex[0], apex[1]);
        }
      }
      ctx.closePath();
      if (this.fillStyle && this.fillStyle !== 'none') {
        ctx.fillStyle = this.fillStyle;
        ctx.fill();
      }
      if (this.strokeStyle && this.strokeStyle !== 'none') {
        ctx.strokeStyle = this.strokeStyle;
        ctx.stroke();
      }
      return this;
    };

    Polygon.prototype.radiate = function() {
      var apex, apexes, ctx, isStroke, _i, _len;

      ctx = this.ctx;
      apexes = this.getApexes();
      isStroke = false;
      if (this.strokeStyle && this.strokeStyle !== 'none') {
        isStroke = true;
      }
      if (isStroke) {
        ctx.strokeStyle = this.strokeStyle;
      }
      for (_i = 0, _len = apexes.length; _i < _len; _i++) {
        apex = apexes[_i];
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(apex[0], apex[1]);
        ctx.closePath();
        if (isStroke) {
          ctx.stroke();
        }
      }
      return this;
    };

    Polygon.prototype.getApexes = function() {
      var apexes, i, _i, _ref;

      apexes = [];
      for (i = _i = 0, _ref = this.sides; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        apexes.push(this.getApex(i));
      }
      return apexes;
    };

    Polygon.prototype.getApex = function(i) {
      var rad, to, x, y;

      rad = this.rotate * Math.PI / 180;
      to = rad + this.interiorAngle * i;
      x = this.x + Math.cos(to) * this.radius;
      y = this.y + Math.sin(to) * this.radius;
      return [x, y];
    };

    Polygon.prototype.fill = function(fillStyle) {
      this.fillStyle = fillStyle;
      this.ctx.fillStyle = this.fillStyle;
      return this;
    };

    Polygon.prototype.stroke = function(strokeStyle, lineWidth) {
      var ctx;

      this.strokeStyle = strokeStyle;
      if (lineWidth == null) {
        lineWidth = this.lineWidth;
      }
      ctx = this.ctx;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = this.strokeStyle;
      return this;
    };

    return Polygon;

  })();

  $.fn.radarChart = function(option) {
    var o, _ref;

    o = $.extend({
      radius: null,
      plotLineColor: 'red',
      plotLineWidth: 3,
      plotBGColor: 'rgba(255, 0, 0, 0.2)',
      gridLength: 5,
      gridLineColor: '#ccc',
      gridLineWidth: 1,
      gridBorderColor: null,
      gridBorderWidth: 3,
      gridBGColor: '#fff',
      gridDivisionStep: 1,
      fontColor: '#000',
      font: 'bold 13px Arial',
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      data: function() {
        var text;

        text = $(this).data('values') || '';
        return text.split(',');
      }
    }, option);
    if ((_ref = o.gridBorderColor) == null) {
      o.gridBorderColor = o.gridLineColor;
    }
    return this.each(function() {
      var $this, apex, cX, cY, ctx, data, dataLength, divisions, font, fontOffsetX, fontOffsetY, grid, gridBorderWidth, gridLineWidth, i, offsetX, offsetY, pentagon, plotLineWidth, point, radius, scale, value, _i, _len;

      if (this.nodeName.toLowerCase() !== 'canvas') {
        return;
      }
      $this = $(this);
      scale = o.scale;
      radius = o.radius * scale || $this.width() / 2 * scale;
      plotLineWidth = o.plotLineWidth * scale;
      gridLineWidth = o.gridLineWidth * scale;
      gridBorderWidth = o.gridBorderWidth * scale;
      font = (o.font || '').replace(/\d+/i, function(d) {
        return d * scale;
      });
      offsetX = o.offsetX * scale;
      offsetY = o.offsetY * scale;
      data = o.data.call(this);
      dataLength = data.length;
      if (dataLength < 3) {
        return;
      }
      ctx = this.getContext('2d');
      cX = radius + offsetX;
      cY = radius + offsetY;
      divisions = radius / o.gridLength;
      i = o.gridLength;
      ctx.font = font;
      while (i) {
        grid = new Polygon(ctx, dataLength, divisions * i, cX, cY);
        if (i === o.gridLength) {
          grid.stroke(o.gridBorderColor, gridBorderWidth).fill(o.gridBGColor).peint();
          grid.stroke(o.gridLineColor, gridLineWidth / 2).radiate();
        } else {
          if (!(i % o.gridDivisionStep)) {
            grid.stroke(o.gridLineColor, gridLineWidth).peint();
          }
        }
        i -= 1;
      }
      ctx.beginPath();
      for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
        value = data[i];
        value = parseFloat($.trim(value));
        point = divisions * value;
        pentagon = new Polygon(null, dataLength, point, cX, cY);
        apex = pentagon.getApex(i);
        if (i === 0) {
          ctx.moveTo(apex[0], apex[1]);
        } else {
          ctx.lineTo(apex[0], apex[1]);
        }
      }
      ctx.lineWidth = plotLineWidth;
      ctx.strokeStyle = o.plotLineColor;
      ctx.fillStyle = o.plotBGColor;
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      i = o.gridLength + 1;
      fontOffsetX = -11;
      fontOffsetY = 8;
      while (i) {
        i -= 1;
        ctx.fillStyle = o.fontColor;
        ctx.strokeStyle = o.gridBGColor;
        ctx.fillText("" + i, cX + fontOffsetX, cY - divisions * i + fontOffsetY);
      }
    });
  };

}).call(this);
