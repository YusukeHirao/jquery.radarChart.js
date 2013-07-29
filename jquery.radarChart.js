// Generated by CoffeeScript 1.6.2
/*
* jquery.radarChart.js
* Author: Yusuke Hirao [http://www.yusukehirao.com]
* Version: 0.3.0.0
* Github: https://github.com/YusukeHirao/jquery.radarChart.js
* Licensed under the MIT License
* Require: jQuery v@1.9.1
*/


(function() {
  'use strict';
  var $, Polygon, RaderChart, RaderChartSVG, w,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  w = this;

  $ = w.jQuery;

  Polygon = (function() {
    Polygon.prototype.ctx = null;

    Polygon.prototype.sides = 3;

    Polygon.prototype.interiorAngle = 0;

    Polygon.prototype.x = 0;

    Polygon.prototype.y = 0;

    Polygon.prototype.radius = 100;

    Polygon.prototype.rotate = 0;

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

    Polygon.prototype.draw = function() {
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
        ctx.fillStyle = 'transparent';
      }
      if (this.strokeStyle && this.strokeStyle !== 'none') {
        ctx.strokeStyle = this.strokeStyle;
        ctx.stroke();
      }
      this.setLineDash([]);
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
      this.setLineDash([]);
      return this;
    };

    Polygon.prototype.scale = function(lineLength) {
      var angle, apex, apexes, ctx, isStroke, x, y, _i, _len;

      if (lineLength == null) {
        lineLength = 5;
      }
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
        x = apex[0], y = apex[1], angle = apex[2];
        ctx.moveTo(x + (Math.sin(angle) * lineLength), y - (Math.cos(angle) * lineLength));
        ctx.lineTo(x - (Math.sin(angle) * lineLength), y + (Math.cos(angle) * lineLength));
        ctx.stroke();
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
      var angle, rotate, x, y;

      rotate = (this.rotate - 90) * Math.PI / 180;
      angle = this.interiorAngle * i + rotate;
      x = this.x + Math.cos(angle) * this.radius;
      y = this.y + Math.sin(angle) * this.radius;
      return [x, y, angle];
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

    Polygon.prototype.dash = function(strokeStyle, lineWidth, dashStyle) {
      this.strokeStyle = strokeStyle;
      if (lineWidth == null) {
        lineWidth = this.lineWidth;
      }
      if (dashStyle == null) {
        dashStyle = [5, 2];
      }
      this.setLineDash(dashStyle);
      return this.stroke(strokeStyle, lineWidth);
    };

    Polygon.prototype.setLineDash = function(dashStyle) {
      var ctx;

      ctx = this.ctx;
      if (ctx.setLineDash) {
        ctx.setLineDash(dashStyle);
      } else if (ctx.mozDash != null) {
        ctx.mozDash = dashStyle;
      } else if (ctx.webkitLineDash != null) {
        ctx.webkitLineDash = dashStyle;
      }
      return this;
    };

    return Polygon;

  })();

  RaderChart = (function() {
    var _max;

    RaderChart.prototype.ctx = null;

    RaderChart.prototype.radius = 0;

    RaderChart.prototype.plotLineColor = 'red';

    RaderChart.prototype.plotLineWidth = 3;

    RaderChart.prototype.plotBGColor = 'rgba(255, 0, 0, 0.2)';

    RaderChart.prototype.gridLength = null;

    RaderChart.prototype.gridLineColor = '#ccc';

    RaderChart.prototype.gridLineWidth = 1;

    RaderChart.prototype.subGridLineColor = '#ccc';

    RaderChart.prototype.subGridLineWidth = 1;

    RaderChart.prototype.subGridType = 0;

    RaderChart.prototype.subScaleLineLength = 5;

    RaderChart.prototype.gridBorderColor = null;

    RaderChart.prototype.gridBorderWidth = 3;

    RaderChart.prototype.gridBGColor = '#fff';

    RaderChart.prototype.divisionGridStep = 1;

    RaderChart.prototype.divisionNumberStep = 1;

    RaderChart.prototype.divisionGridPartition = 1;

    RaderChart.prototype.fontColor = '#000';

    RaderChart.prototype.font = 'bold 13px Arial';

    RaderChart.prototype.offsetX = 0;

    RaderChart.prototype.offsetY = 0;

    RaderChart.prototype.scale = 1;

    RaderChart.prototype.cX = 0;

    RaderChart.prototype.cY = 0;

    RaderChart.prototype.divisions = 0;

    RaderChart.prototype.apexLength = 0;

    RaderChart.prototype.datas = null;

    RaderChart.dataParser = function(dataQuery) {
      var data, datas;

      dataQuery = dataQuery.replace(/[^0-9,\.\|\-]/g, '');
      datas = dataQuery.split('|');
      datas = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = datas.length; _i < _len; _i++) {
          data = datas[_i];
          _results.push(data.split(','));
        }
        return _results;
      })();
      return datas;
    };

    _max = function(data) {
      return Math.max.apply(Math, data);
    };

    function RaderChart(ctx, option) {
      var scale, _ref;

      this.ctx = ctx;
      if (!(this instanceof RaderChart)) {
        return new RaderChart(ctx, option);
      }
      $.extend(this, option);
      if ((_ref = this.gridBorderColor) == null) {
        this.gridBorderColor = this.gridLineColor;
      }
      switch (this.subGridType) {
        case 'line':
          this.subGridType = 0;
          break;
        case 'dash':
          this.subGridType = 1;
          break;
        case 'scale':
          this.subGridType = 2;
          break;
        default:
          this.subGridType = 0;
      }
      if (this.scale !== 1) {
        scale = this.scale;
        this.radius = this.radius * scale;
        this.plotLineWidth = this.plotLineWidth * scale;
        this.gridLineWidth = this.gridLineWidth * scale;
        this.gridBorderWidth = this.gridBorderWidth * scale;
        this.font = (this.font || '').replace(/\d+/i, function(d) {
          return d * scale;
        });
        this.offsetX = this.offsetX * scale;
        this.offsetY = this.offsetY * scale;
      }
      this.cX = this.radius + this.offsetX;
      this.cY = this.radius + this.offsetY;
      this.datas = [];
    }

    RaderChart.prototype.add = function(data) {
      var addData, max, _i, _len, _ref;

      if ($.isArray(data[0])) {
        addData = data;
      } else {
        addData = [data];
      }
      this.datas = this.datas.concat(data);
      _ref = this.datas;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        max = Math.ceil(_max(data));
        this.gridLength = Math.max(max, this.gridLength);
        this.apexLength = Math.max(data.length, this.apexLength);
      }
      this.divisions = this.radius / this.gridLength;
      return this;
    };

    RaderChart.prototype.draw = function() {
      var colorLength, data, i, isMultiColor, _i, _len, _ref;

      this.drawGrid();
      isMultiColor = $.isArray(this.plotLineColor);
      if (isMultiColor) {
        colorLength = this.plotLineColor.length;
      }
      _ref = this.datas;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        data = _ref[i];
        if (isMultiColor) {
          this.drawData(data, this.plotLineColor[i % colorLength]);
        } else {
          this.drawData(data);
        }
      }
      this.drawNumber();
      return this;
    };

    RaderChart.prototype.drawData = function(data, plotLineColor) {
      var apex, i, pentagon, point, value;

      if (plotLineColor == null) {
        plotLineColor = this.plotLineColor;
      }
      this.ctx.beginPath();
      i = 0;
      while (i < this.apexLength) {
        value = parseFloat(data[i]) || 0;
        point = this.divisions * value;
        pentagon = new Polygon(null, this.apexLength, point, this.cX, this.cY);
        apex = pentagon.getApex(i);
        if (i === 0) {
          this.ctx.moveTo(apex[0], apex[1]);
        } else {
          this.ctx.lineTo(apex[0], apex[1]);
        }
        i += 1;
      }
      this.ctx.lineWidth = this.plotLineWidth;
      this.ctx.strokeStyle = plotLineColor;
      this.ctx.fillStyle = this.plotBGColor;
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fill();
      return this;
    };

    RaderChart.prototype.drawGrid = function() {
      var div, divisions, grid, i;

      divisions = this.divisions / this.divisionGridPartition;
      i = this.gridLength * this.divisionGridPartition;
      while (i) {
        grid = new Polygon(this.ctx, this.apexLength, divisions * i, this.cX, this.cY);
        if (i === this.gridLength * this.divisionGridPartition) {
          grid.stroke(this.gridBorderColor, this.gridBorderWidth).fill(this.gridBGColor).draw();
          grid.stroke(this.gridLineColor, this.gridLineWidth / 2).radiate();
        } else {
          div = i / this.divisionGridPartition;
          if (div === Math.floor(div)) {
            grid.stroke(this.gridLineColor, this.gridLineWidth).draw();
          } else {
            switch (this.subGridType) {
              case 0:
                grid.stroke(this.subGridLineColor, this.subGridLineWidth / 3).draw();
                break;
              case 1:
                grid.dash(this.subGridLineColor, this.subGridLineWidth).draw();
                break;
              default:
                grid.stroke(this.gridLineColor, this.gridLineWidth / 2).scale(this.subScaleLineLength);
            }
          }
        }
        i -= 1;
      }
      return this;
    };

    RaderChart.prototype.drawNumber = function() {
      var fontOffsetX, fontOffsetY, i;

      i = this.gridLength + 1;
      fontOffsetX = -11;
      fontOffsetY = 8;
      this.ctx.font = this.font;
      this.ctx.fillStyle = this.fontColor;
      this.ctx.strokeStyle = this.gridBGColor;
      while (i) {
        i -= 1;
        if (!(i % this.divisionNumberStep)) {
          this.ctx.fillText("" + i, this.cX + fontOffsetX, this.cY - this.divisions * i + fontOffsetY);
        }
      }
      return this;
    };

    return RaderChart;

  })();

  RaderChartSVG = (function(_super) {
    var SVGHelper;

    __extends(RaderChartSVG, _super);

    SVGHelper = (function() {
      function SVGHelper() {}

      SVGHelper.apexesToPathString = function(apexes) {
        var apex, res;

        res = (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = apexes.length; _i < _len; _i++) {
            apex = apexes[_i];
            _results.push("" + apex[0] + " " + apex[1]);
          }
          return _results;
        })();
        return "M" + (res.join('L'));
      };

      return SVGHelper;

    })();

    RaderChartSVG.prototype.canvas = null;

    RaderChartSVG.prototype.svg = null;

    function RaderChartSVG(canvas, option) {
      var $canvas, $svg, height, width;

      this.canvas = canvas;
      if (!(this instanceof RaderChartSVG)) {
        return new RaderChartSVG(canvas, option);
      }
      RaderChartSVG.__super__.constructor.apply(this, arguments);
      this.ctx = null;
      $canvas = $(canvas);
      width = $canvas.attr('width') || $canvas.width();
      height = $canvas.attr('height') || $canvas.height();
      $canvas.css({
        display: 'inline-block',
        width: width,
        height: height
      });
      $svg = $('<div class="__rader_raphael" />');
      $svg.insertAfter($canvas);
      $svg.css({
        position: 'absolute',
        top: $canvas.position().top,
        left: $canvas.position().left
      });
      this.svg = Raphael($svg[0], width, height);
    }

    RaderChartSVG.prototype.drawGrid = function() {
      var angle, apex, apexes, bgPath, bgPathString, div, divisions, grid, gridPath, gridPathString, i, lineLength, radiate, radiatePathString, scale, scalePathString, x, y, _i, _j, _len, _len1;

      divisions = this.divisions / this.divisionGridPartition;
      i = this.gridLength * this.divisionGridPartition;
      while (i) {
        grid = new Polygon(null, this.apexLength, divisions * i, this.cX, this.cY);
        if (i === this.gridLength * this.divisionGridPartition) {
          apexes = grid.getApexes();
          bgPathString = SVGHelper.apexesToPathString(apexes) + 'Z';
          bgPath = this.svg.path(bgPathString);
          bgPath.attr({
            stroke: this.gridBorderColor,
            'stroke-width': this.gridBorderWidth,
            fill: this.gridBGColor
          });
          radiatePathString = '';
          for (_i = 0, _len = apexes.length; _i < _len; _i++) {
            apex = apexes[_i];
            radiatePathString += "M" + grid.x + " " + grid.y + "L" + apex[0] + " " + apex[1] + "Z";
          }
          radiate = this.svg.path(radiatePathString);
          radiate.attr({
            stroke: this.gridLineColor,
            'stroke-width': this.gridLineWidth / 2
          });
        } else {
          div = i / this.divisionGridPartition;
          if (div === Math.floor(div)) {
            apexes = grid.getApexes();
            gridPathString = SVGHelper.apexesToPathString(apexes) + 'Z';
            gridPath = this.svg.path(gridPathString);
            gridPath.attr({
              stroke: this.gridLineColor,
              'stroke-width': this.gridLineWidth
            });
          } else {
            switch (this.subGridType) {
              case 0:
                apexes = grid.getApexes();
                gridPathString = SVGHelper.apexesToPathString(apexes) + 'Z';
                gridPath = this.svg.path(gridPathString);
                gridPath.attr({
                  stroke: this.subGridLineColor,
                  'stroke-width': this.subGridLineWidth / 3
                });
                break;
              case 1:
                break;
              default:
                apexes = grid.getApexes();
                lineLength = this.subScaleLineLength;
                scalePathString = '';
                for (_j = 0, _len1 = apexes.length; _j < _len1; _j++) {
                  apex = apexes[_j];
                  x = apex[0], y = apex[1], angle = apex[2];
                  scalePathString += 'M' + (x + (Math.sin(angle) * lineLength)) + ' ' + (y - (Math.cos(angle) * lineLength));
                  scalePathString += 'L' + (x - (Math.sin(angle) * lineLength)) + ' ' + (y + (Math.cos(angle) * lineLength));
                }
                scale = this.svg.path(scalePathString);
                scale.attr({
                  stroke: this.gridLineColor,
                  'stroke-width': this.gridLineWidth / 2
                });
            }
          }
        }
        i -= 1;
      }
      return this;
    };

    RaderChartSVG.prototype.drawData = function(data, plotLineColor) {
      var apex, i, pentagon, point, res, value;

      if (plotLineColor == null) {
        plotLineColor = this.plotLineColor;
      }
      i = 0;
      res = '';
      while (i < this.apexLength) {
        value = parseFloat(data[i]) || 0;
        point = this.divisions * value;
        pentagon = new Polygon(null, this.apexLength, point, this.cX, this.cY);
        apex = pentagon.getApex(i);
        if (i === 0) {
          res += "M" + apex[0] + " " + apex[1];
        } else {
          res += "L" + apex[0] + " " + apex[1];
        }
        i += 1;
      }
      res += 'Z';
      this.svg.path(res).attr({
        stroke: plotLineColor,
        fill: this.plotBGColor,
        'stroke-width': this.plotLineWidth
      });
      return this;
    };

    RaderChartSVG.prototype.drawNumber = function() {
      var font, fontOffsetX, fontOffsetY, i, text, x, y;

      i = this.gridLength + 1;
      fontOffsetX = -11;
      fontOffsetY = 8;
      while (i) {
        i -= 1;
        if (!(i % this.divisionNumberStep)) {
          x = this.cX + fontOffsetX;
          y = this.cY - this.divisions * i + fontOffsetY;
          text = "" + i;
          font = this.svg.text(x, y, text);
          font.attr({
            font: this.font,
            fill: this.fontColor
          });
        }
      }
      return this;
    };

    return RaderChartSVG;

  }).call(this, RaderChart);

  $.fn.radarChart = function(option) {
    option = $.extend({
      data: function(RaderChart) {
        return RaderChart.dataParser($(this).data('values'));
      }
    }, option);
    return this.each(function() {
      var $this, chart, ctx, data, _ref;

      if (this.nodeName.toLowerCase() !== 'canvas') {
        return;
      }
      $this = $(this);
      if ((_ref = option.radius) == null) {
        option.radius = Math.min($this.width(), $this.height()) / 2;
      }
      data = $.isFunction(option.data) ? option.data.call(this, RaderChart) : $.isArray(option.data[0]) ? data = option.data : data = [option.data];
      if (this.getContext) {
        ctx = this.getContext('2d');
        chart = new RaderChart(ctx, option);
      } else {
        chart = new RaderChartSVG(this, option);
      }
      chart.add(data);
      chart.draw();
    });
  };

}).call(this);
