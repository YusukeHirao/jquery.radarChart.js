// Generated by CoffeeScript 1.9.1

/*
* jquery.radarChart.js
* Author: YusukeHirao
* Version: 1.0.0-beta
* Github: https://github.com/YusukeHirao/jquery.radarChart.js
* Licensed under the MIT License
* Require: jQuery v@1.9.1
 */

(function() {
  'use strict';
  var $, Polygon, RaderChart, RaderChartSVG, w,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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

    function Polygon(ctx1, sides, radius, x1, y1) {
      this.ctx = ctx1;
      this.sides = sides != null ? sides : 3;
      this.radius = radius != null ? radius : 100;
      this.x = x1 != null ? x1 : 0;
      this.y = y1 != null ? y1 : 0;
      this.interiorAngle = Math.PI * 2 / this.sides;
    }

    Polygon.prototype.draw = function() {
      var apex, apexes, ctx, i, j, len;
      ctx = this.ctx;
      ctx.beginPath();
      apexes = this.getApexes();
      for (i = j = 0, len = apexes.length; j < len; i = ++j) {
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

    Polygon.prototype.radiate = function(donutRadius) {
      var apex, apexes, ctx, donutPolygon, i, isStroke, j, len;
      if (donutRadius == null) {
        donutRadius = 0;
      }
      ctx = this.ctx;
      donutPolygon = new Polygon(null, this.sides, donutRadius, this.x, this.y);
      apexes = this.getApexes();
      isStroke = false;
      if (this.strokeStyle && this.strokeStyle !== 'none') {
        isStroke = true;
      }
      if (isStroke) {
        ctx.strokeStyle = this.strokeStyle;
      }
      for (i = j = 0, len = apexes.length; j < len; i = ++j) {
        apex = apexes[i];
        ctx.beginPath();
        ctx.moveTo(donutPolygon.getApex(i)[0], donutPolygon.getApex(i)[1]);
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
      var angle, apex, apexes, ctx, isStroke, j, len, x, y;
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
      for (j = 0, len = apexes.length; j < len; j++) {
        apex = apexes[j];
        ctx.beginPath();
        x = apex[0], y = apex[1], angle = apex[2];
        ctx.moveTo(x + (Math.sin(angle) * lineLength), y - (Math.cos(angle) * lineLength));
        ctx.lineTo(x - (Math.sin(angle) * lineLength), y + (Math.cos(angle) * lineLength));
        ctx.stroke();
      }
      return this;
    };

    Polygon.prototype.getApexes = function() {
      var apexes, i, j, ref;
      apexes = [];
      for (i = j = 0, ref = this.sides; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
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

    Polygon.prototype.stroke = function(strokeStyle1, lineWidth) {
      var ctx;
      this.strokeStyle = strokeStyle1;
      if (lineWidth == null) {
        lineWidth = this.lineWidth;
      }
      ctx = this.ctx;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = this.strokeStyle;
      return this;
    };

    Polygon.prototype.dash = function(strokeStyle1, lineWidth, dashStyle) {
      this.strokeStyle = strokeStyle1;
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

    Polygon.prototype.clone = function() {
      return new Polygon(this.ctx, this.sides, this.radius, this.x, this.y);
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

    RaderChart.prototype.fontOffsetX = 0;

    RaderChart.prototype.fontOffsetY = 0;

    RaderChart.prototype.scale = 1;

    RaderChart.prototype.cX = 0;

    RaderChart.prototype.cY = 0;

    RaderChart.prototype.donutRadius = 0;

    RaderChart.prototype.divisions = 0;

    RaderChart.prototype.apexLength = 0;

    RaderChart.prototype.datas = null;

    RaderChart.prototype.labels = null;

    RaderChart.prototype.backgroundImage = null;

    RaderChart.prototype.backgroundPositionX = null;

    RaderChart.prototype.backgroundPositionY = null;

    RaderChart.prototype.backgroundSizeWidth = null;

    RaderChart.prototype.backgroundSizeHeight = null;

    RaderChart.dataParser = function(dataQuery) {
      var data, datas;
      dataQuery = dataQuery.replace(/[^0-9,\.\|\-]/g, '');
      datas = dataQuery.split('|');
      datas = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = datas.length; j < len; j++) {
          data = datas[j];
          results.push(data.split(','));
        }
        return results;
      })();
      return datas;
    };

    _max = function(data) {
      return Math.max.apply(Math, data);
    };

    function RaderChart(ctx1, option) {
      var scale;
      this.ctx = ctx1;
      if (!(this instanceof RaderChart)) {
        return new RaderChart(ctx, option);
      }
      $.extend(this, option);
      if (this.gridBorderColor == null) {
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
      var addData, j, len, max, ref;
      if ($.isArray(data[0])) {
        addData = data;
      } else {
        addData = [data];
      }
      this.datas = this.datas.concat(data);
      ref = this.datas;
      for (j = 0, len = ref.length; j < len; j++) {
        data = ref[j];
        max = Math.ceil(_max(data));
        this.gridLength = Math.max(max, this.gridLength);
        this.apexLength = Math.max(data.length, this.apexLength);
      }
      this.divisions = this.radius / this.gridLength;
      return this;
    };

    RaderChart.prototype.draw = function() {
      var img;
      if (this.backgroundImage) {
        img = new Image();
        img.onload = $.proxy(this.drawAfterImageLoaded, this, img);
        img.src = this.backgroundImage;
      } else {
        this.drawAfterImageLoaded();
      }
      return this;
    };

    RaderChart.prototype.drawAfterImageLoaded = function(loadedImage) {
      var colorLength, data, i, isMultiColor, j, len, ref;
      this.drawBackground(loadedImage);
      this.drawGrid();
      isMultiColor = $.isArray(this.plotLineColor);
      if (isMultiColor) {
        colorLength = this.plotLineColor.length;
      }
      ref = this.datas;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        data = ref[i];
        if (isMultiColor) {
          this.drawData(data, this.plotLineColor[i % colorLength]);
        } else {
          this.drawData(data);
        }
      }
      this.drawLabels();
      return this;
    };

    RaderChart.prototype.drawData = function(data, plotLineColor) {
      var apex, i, point, polygon, value;
      if (plotLineColor == null) {
        plotLineColor = this.plotLineColor;
      }
      this.ctx.beginPath();
      i = 0;
      while (i < this.apexLength) {
        value = parseFloat(data[i]) || 0;
        point = this.divisions * value;
        if (this.donutRadius) {
          point = (this.radius - this.donutRadius) * (point / this.radius) + this.donutRadius;
        }
        polygon = new Polygon(null, this.apexLength, point, this.cX, this.cY);
        apex = polygon.getApex(i);
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

    RaderChart.prototype.drawBackground = function(loadedImage) {
      var area, dh, dw, dx, dy;
      area = new Polygon(this.ctx, this.apexLength, this.radius, this.cX, this.cY);
      area.stroke().fill(this.gridBGColor).draw();
      dx = this.backgroundPositionX || 0;
      dy = this.backgroundPositionY || 0;
      dw = this.backgroundSizeWidth || loadedImage.width;
      dh = this.backgroundSizeHeight || this.backgroundSizeWidth * (loadedImage.height / loadedImage.width);
      if (loadedImage) {
        this.ctx.drawImage(loadedImage, 0, 0, loadedImage.width, loadedImage.height, dx, dy, dw, dh);
      }
      return this;
    };

    RaderChart.prototype.drawGrid = function() {
      var div, divisions, grid, i, point;
      divisions = this.divisions / this.divisionGridPartition;
      i = this.gridLength * this.divisionGridPartition;
      while (i >= 0) {
        point = divisions * i;
        if (this.donutRadius) {
          point = (this.radius - this.donutRadius) * (point / this.radius) + this.donutRadius;
        }
        grid = new Polygon(this.ctx, this.apexLength, point, this.cX, this.cY);
        if (i === this.gridLength * this.divisionGridPartition) {
          grid.stroke(this.gridBorderColor, this.gridBorderWidth).draw();
          grid.stroke(this.gridLineColor, this.gridLineWidth / 2).radiate(this.donutRadius);
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

    RaderChart.prototype.drawLabels = function() {
      var fontOffsetX, fontOffsetY, i, point, text;
      i = this.gridLength + 1;
      fontOffsetX = -11;
      fontOffsetY = 8;
      this.ctx.font = this.font;
      this.ctx.fillStyle = this.fontColor;
      this.ctx.strokeStyle = this.gridBGColor;
      while (i) {
        i -= 1;
        text = this.labels ? this.labels[i] || i : void 0;
        point = this.divisions * i;
        if (this.donutRadius) {
          point = (this.radius - this.donutRadius) * (point / this.radius) + this.donutRadius;
        } else {
          "" + i;
        }
        if (!(i % this.divisionNumberStep)) {
          this.ctx.fillText("" + text, this.cX + fontOffsetX + this.fontOffsetX, this.cY - point + fontOffsetY + this.fontOffsetY);
        }
      }
      return this;
    };

    return RaderChart;

  })();

  RaderChartSVG = (function(superClass) {
    var SVGHelper;

    extend(RaderChartSVG, superClass);

    SVGHelper = (function() {
      function SVGHelper() {}

      SVGHelper.apexesToPathString = function(apexes) {
        var apex, res;
        res = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = apexes.length; j < len; j++) {
            apex = apexes[j];
            results.push(apex[0] + " " + apex[1]);
          }
          return results;
        })();
        return "M" + (res.join('L'));
      };

      return SVGHelper;

    })();

    RaderChartSVG.prototype.canvas = null;

    RaderChartSVG.prototype.svg = null;

    function RaderChartSVG(canvas1, option) {
      var $canvas, $svg, height, width;
      this.canvas = canvas1;
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
      var angle, apex, apexes, bgPath, bgPathString, div, divisions, grid, gridPath, gridPathString, i, j, k, len, len1, lineLength, radiate, radiatePathString, scale, scalePathString, x, y;
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
          for (j = 0, len = apexes.length; j < len; j++) {
            apex = apexes[j];
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
                for (k = 0, len1 = apexes.length; k < len1; k++) {
                  apex = apexes[k];
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
      var apex, i, point, polygon, res, value;
      if (plotLineColor == null) {
        plotLineColor = this.plotLineColor;
      }
      i = 0;
      res = '';
      while (i < this.apexLength) {
        value = parseFloat(data[i]) || 0;
        point = this.divisions * value;
        polygon = new Polygon(null, this.apexLength, point, this.cX, this.cY);
        apex = polygon.getApex(i);
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

    RaderChartSVG.prototype.drawLabels = function() {
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

  })(RaderChart);

  $.fn.radarChart = function(option) {
    option = $.extend({
      data: function(RaderChart) {
        return RaderChart.dataParser($(this).data('values'));
      }
    }, option);
    return this.each(function() {
      var $this, chart, ctx, data;
      if (this.nodeName.toLowerCase() !== 'canvas') {
        return;
      }
      $this = $(this);
      if (option.radius == null) {
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
