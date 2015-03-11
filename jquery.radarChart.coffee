###
* jquery.radarChart.js
* Author: Yusuke Hirao [http://www.yusukehirao.com]
* Version: 0.3.0.0
* Github: https://github.com/YusukeHirao/jquery.radarChart.js
* Licensed under the MIT License
* Require: jQuery v@1.9.1
###

'use strict'

w = @
$ = w.jQuery

# debug = (obj) ->
# 	res = []
# 	for k, v of obj
# 		res.push "#{k}: #{v}"
# 	return res.join '\n'

class Polygon
	ctx: null
	sides: 3
	interiorAngle: 0
	x: 0
	y: 0
	radius: 100
	rotate: 0
	strokeStyle: '#000'
	lineWidth: 1
	fillStyle: 'none'

	# コンストラクタ
	# @param {CanvasRenderingContext2D} ctx キャンバスコンテキスト
	# @param {Number} sides 頂点の数
	# @param {Number} radius 半径の長さ
	# @param {Number} x x方向オフセット
	# @param {Number} y y方向オフセット
	constructor: (@ctx, @sides = 3, @radius = 100, @x = 0, @y = 0) ->
		# 内角
		@interiorAngle = Math.PI * 2 / @sides

	# 多角形の描画
	draw: ->
		ctx = @ctx
		ctx.beginPath()
		apexes = @getApexes()
		for apex, i in apexes
			if i is 0
				ctx.moveTo apex[0], apex[1]
			else
				ctx.lineTo apex[0], apex[1]
		ctx.closePath()
		if @fillStyle and @fillStyle isnt 'none'
			ctx.fillStyle = @fillStyle
			ctx.fill()
			ctx.fillStyle = 'transparent'
		if @strokeStyle and @strokeStyle isnt 'none'
			ctx.strokeStyle = @strokeStyle
			ctx.stroke()
		@setLineDash []
		return @

	# 放射状の線を描画
	radiate: ->
		ctx = @ctx
		apexes = @getApexes()
		isStroke = off
		if @strokeStyle and @strokeStyle isnt 'none'
			isStroke = on
		ctx.strokeStyle = @strokeStyle if isStroke
		for apex in apexes
			ctx.beginPath()
			ctx.moveTo @x, @y
			ctx.lineTo apex[0], apex[1]
			ctx.closePath()
			ctx.stroke() if isStroke
		@setLineDash []
		return @

	# 目盛線の描画
	# @param {Number} lineLength 目盛線の長さ
	scale: (lineLength = 5) ->
		ctx = @ctx
		apexes = @getApexes()
		isStroke = off
		if @strokeStyle and @strokeStyle isnt 'none'
			isStroke = on
		ctx.strokeStyle = @strokeStyle if isStroke
		for apex in apexes
			ctx.beginPath()
			[x, y, angle] = apex
			ctx.moveTo x + (Math.sin(angle) * lineLength), y - (Math.cos(angle) * lineLength)
			ctx.lineTo x - (Math.sin(angle) * lineLength), y + (Math.cos(angle) * lineLength)
			ctx.stroke()
		return @

	# 各頂点を二次元配列で返す
	# @return {Array}
	getApexes: ->
		apexes = []
		for i in [0..@sides]
			apexes.push @getApex i
		return apexes

	# 頂点の座標と座標の角度を返す
	# @param {Number} i (時計回りで)i番目の頂点
	# @return {Array}
	getApex: (i) ->
		rotate = (@rotate - 90) * Math.PI / 180
		angle = @interiorAngle * i + rotate
		x = @x + Math.cos(angle) * @radius
		y = @y + Math.sin(angle) * @radius
		return [x, y, angle]

	# 塗りの設定
	# @param {String} fillStyle カラーコード
	# @return {Polygon}
	fill: (@fillStyle) ->
		@ctx.fillStyle = @fillStyle
		return @

	# 線の設定
	# @param {String} strokeStyle カラーコード
	# @param {Number} lineWidth 線の太さ
	# @return {Polygon}
	stroke: (@strokeStyle, lineWidth = @lineWidth) ->
		ctx = @ctx
		ctx.lineWidth = lineWidth
		ctx.strokeStyle = @strokeStyle
		return @

	# 破線の設定
	dash: (@strokeStyle, lineWidth = @lineWidth, dashStyle = [5,2]) ->
		@setLineDash dashStyle
		return @stroke strokeStyle, lineWidth

	# 破線の登録
	setLineDash: (dashStyle) ->
		ctx = @ctx
		if ctx.setLineDash
			ctx.setLineDash dashStyle
		else if ctx.mozDash?
			ctx.mozDash = dashStyle
		else if ctx.webkitLineDash?
			ctx.webkitLineDash = dashStyle
		return @

class RaderChart
	ctx: null
	radius: 0
	plotLineColor: 'red'
	plotLineWidth: 3
	plotBGColor: 'rgba(255, 0, 0, 0.2)'
	gridLength: null
	gridLineColor: '#ccc'
	gridLineWidth: 1
	subGridLineColor: '#ccc'
	subGridLineWidth: 1
	subGridType: 0
	subScaleLineLength: 5
	gridBorderColor: null
	gridBorderWidth: 3
	gridBGColor: '#fff'
	divisionGridStep: 1
	divisionNumberStep: 1
	divisionGridPartition: 1
	fontColor: '#000'
	font: 'bold 13px Arial'
	offsetX: 0
	offsetY: 0
	scale: 1
	cX: 0
	cY: 0
	divisions: 0
	apexLength: 0
	datas: null
	backgroundImage: null
	backgroundPositionX: null
	backgroundPositionY: null
	backgroundSizeWidth: null
	backgroundSizeHeight: null # null is auto

	# データの整形
	@dataParser = (dataQuery) ->
		dataQuery = dataQuery.replace /[^0-9,\.\|\-]/g, ''
		datas = dataQuery.split '|'
		datas = for data in datas
			data.split ','
		return datas

	# 配列内の最大値を得る
	_max = (data) ->
		return Math.max.apply Math, data

	# コンストラクタ
	constructor: (@ctx, option) ->
		unless @ instanceof RaderChart
			return new RaderChart ctx, option
		$.extend @, option
		# 特に指定しなければ gridLineColor と同じにする
		@gridBorderColor ?= @gridLineColor
		# サブグリッドの種類
		switch @subGridType
			when 'line'
				@subGridType = 0
			when 'dash'
				@subGridType = 1
			when 'scale'
				@subGridType = 2
			else
				@subGridType = 0
		# 数値情報
		if @scale isnt 1
			scale = @scale
			@radius = @radius * scale
			@plotLineWidth = @plotLineWidth * scale
			@gridLineWidth = @gridLineWidth * scale
			@gridBorderWidth = @gridBorderWidth * scale
			@font = (@font or '').replace /\d+/i, (d) -> d * scale
			@offsetX = @offsetX * scale
			@offsetY = @offsetY * scale
		# 中心の座標
		@cX = @radius + @offsetX
		@cY = @radius + @offsetY
		# データ管理
		@datas = []

	# インスタンスメソッド
	# データの追加
	add: (data) ->
		if $.isArray data[0]
			addData = data
		else
			addData = [data]
		@datas = @datas.concat data
		for data in @datas
			max = Math.ceil _max data
			@gridLength = Math.max max, @gridLength
			@apexLength = Math.max data.length, @apexLength
		# 目盛の高さ
		@divisions = @radius / @gridLength
		return @

	# チャートの描画
	draw: ->
		if @backgroundImage
			img = new Image()
			img.onload = $.proxy @drawAfterImageLoaded, @, img
			img.src = @backgroundImage
		else
			@drawAfterImageLoaded()
		return @

	# チャートの描画（画像の読み込みが完了してから）
	# @param {HTMLImgElement} loadedImage
	drawAfterImageLoaded: (loadedImage) ->
		# 背景の描画
		@drawBackground loadedImage
		# グリッドの描画
		@drawGrid()
		# データの描画
		isMultiColor = $.isArray @plotLineColor
		colorLength = @plotLineColor.length if isMultiColor
		for data, i in @datas
			if isMultiColor
				@drawData data, @plotLineColor[i % colorLength]
			else
				@drawData data
		# 目盛数値の描画
		@drawNumber()
		return @

	# データの描画
	drawData: (data, plotLineColor = @plotLineColor) ->
		@ctx.beginPath()
		i = 0
		while i < @apexLength
			value = parseFloat(data[i]) or 0
			point = @divisions * value
			pentagon = new Polygon null, @apexLength, point, @cX, @cY
			apex = pentagon.getApex i
			if i is 0
				@ctx.moveTo apex[0], apex[1]
			else
				@ctx.lineTo apex[0], apex[1]
			i += 1
		@ctx.lineWidth = @plotLineWidth
		@ctx.strokeStyle = plotLineColor
		@ctx.fillStyle = @plotBGColor
		@ctx.closePath()
		@ctx.stroke()
		@ctx.fill()
		return @

	# 背景の描画
	drawBackground: (loadedImage) ->
		# 背景色
		area = new Polygon @ctx, @apexLength, @radius, @cX, @cY
		area.stroke().fill(@gridBGColor).draw()
		dx = @backgroundPositionX or 0
		dy = @backgroundPositionY or 0
		dw = @backgroundSizeWidth or loadedImage.width
		# @backgroundSizeHeight が null だと 縦横比キープ
		dh = @backgroundSizeHeight or @backgroundSizeWidth * (loadedImage.height / loadedImage.width)
		if loadedImage
			@ctx.drawImage loadedImage, 0, 0, loadedImage.width, loadedImage.height, dx, dy, dw, dh
		return @

	# グリッドの描画
	drawGrid: ->
		divisions = @divisions / @divisionGridPartition
		i = @gridLength * @divisionGridPartition
		while i
			grid = new Polygon @ctx, @apexLength, divisions * i, @cX, @cY
			if i is @gridLength * @divisionGridPartition
				# 外枠の線と背景色の描画
				grid.stroke(@gridBorderColor, @gridBorderWidth).draw()
				# 放射状線の描画
				grid.stroke(@gridLineColor, @gridLineWidth / 2).radiate()
			else
				div = i / @divisionGridPartition
				# メイングリッド
				if div is Math.floor div
					grid.stroke(@gridLineColor, @gridLineWidth).draw()
				# サブグリッド
				else
					switch @subGridType
						when 0
							grid.stroke(@subGridLineColor, @subGridLineWidth / 3).draw()
						when 1
							grid.dash(@subGridLineColor, @subGridLineWidth).draw()
						else
							grid.stroke(@gridLineColor, @gridLineWidth / 2).scale @subScaleLineLength
			i -= 1
		return @

	# 目盛数値の描画
	drawNumber: ->
		i = @gridLength + 1
		fontOffsetX = -11
		fontOffsetY = 8
		@ctx.font = @font
		@ctx.fillStyle = @fontColor
		@ctx.strokeStyle = @gridBGColor
		while i
			i -= 1
			if not (i % @divisionNumberStep)
				@ctx.fillText "#{i}", @cX + fontOffsetX, @cY - @divisions * i + fontOffsetY
		return @

class RaderChartSVG extends RaderChart

	class SVGHelper

		@apexesToPathString = (apexes) ->
			res = for apex in apexes
				"#{apex[0]} #{apex[1]}"
			return "M#{res.join('L')}"

	canvas: null
	svg: null

	# コンストラクタ
	constructor: (@canvas, option) ->
		unless @ instanceof RaderChartSVG
			return new RaderChartSVG canvas, option
		super

		@ctx = null

		$canvas = $ canvas

		width = $canvas.attr('width') or $canvas.width()
		height = $canvas.attr('height') or $canvas.height()

		$canvas.css
			display: 'inline-block'
			width: width
			height: height

		$svg = $ '<div class="__rader_raphael" />'
		$svg.insertAfter $canvas
		$svg.css
			position: 'absolute'
			top: $canvas.position().top
			left: $canvas.position().left

		@svg = Raphael $svg[0], width, height

	drawGrid: ->
		divisions = @divisions / @divisionGridPartition
		i = @gridLength * @divisionGridPartition
		while i
			grid = new Polygon null, @apexLength, divisions * i, @cX, @cY
			if i is @gridLength * @divisionGridPartition
				apexes = grid.getApexes()
				bgPathString = SVGHelper.apexesToPathString(apexes) + 'Z'
				bgPath = @svg.path bgPathString
				bgPath.attr
					stroke: @gridBorderColor
					'stroke-width': @gridBorderWidth
					fill: @gridBGColor
				radiatePathString = ''
				for apex in apexes
					radiatePathString += "M#{grid.x} #{grid.y}L#{apex[0]} #{apex[1]}Z"
				radiate = @svg.path radiatePathString
				radiate.attr
					stroke: @gridLineColor
					'stroke-width': @gridLineWidth / 2
			else
				div = i / @divisionGridPartition
				# メイングリッド
				if div is Math.floor div
					apexes = grid.getApexes()
					gridPathString = SVGHelper.apexesToPathString(apexes) + 'Z'
					gridPath = @svg.path gridPathString
					gridPath.attr
						stroke: @gridLineColor
						'stroke-width': @gridLineWidth
				# サブグリッド
				else
					switch @subGridType
						when 0
							apexes = grid.getApexes()
							gridPathString = SVGHelper.apexesToPathString(apexes) + 'Z'
							gridPath = @svg.path gridPathString
							gridPath.attr
								stroke: @subGridLineColor
								'stroke-width': @subGridLineWidth / 3
						when 1 # TODO:
							# grid.dash(@subGridLineColor, @subGridLineWidth).draw()
						else
							apexes = grid.getApexes()
							lineLength = @subScaleLineLength
							scalePathString = ''
							for apex in apexes
								[x, y, angle] = apex
								scalePathString += 'M' + (x + (Math.sin(angle) * lineLength)) + ' ' +  (y - (Math.cos(angle) * lineLength))
								scalePathString += 'L' + (x - (Math.sin(angle) * lineLength)) + ' ' +  (y + (Math.cos(angle) * lineLength))
							scale = @svg.path scalePathString
							scale.attr
								stroke: @gridLineColor
								'stroke-width': @gridLineWidth / 2
			i -= 1
		return @


	# データの描画
	drawData: (data, plotLineColor = @plotLineColor) ->
		i = 0
		res = ''
		while i < @apexLength
			value = parseFloat(data[i]) or 0
			point = @divisions * value
			pentagon = new Polygon null, @apexLength, point, @cX, @cY
			apex = pentagon.getApex i
			if i is 0
				res += "M#{apex[0]} #{apex[1]}"
			else
				res += "L#{apex[0]} #{apex[1]}"
			i += 1
		res += 'Z'
		@svg.path(res).attr
			stroke: plotLineColor
			fill: @plotBGColor
			'stroke-width': @plotLineWidth
		return @


	# 目盛数値の描画
	drawNumber: ->
		i = @gridLength + 1
		fontOffsetX = -11
		fontOffsetY = 8
		while i
			i -= 1
			if not (i % @divisionNumberStep)
				x = @cX + fontOffsetX
				y = @cY - @divisions * i + fontOffsetY
				text = "#{i}"
				font = @svg.text x, y, text
				font.attr
					font: @font
					fill: @fontColor
					# stroke: @gridBGColor # TODO: 境界線が塗りを食いつぶす
		return @


# プラグイン
$.fn.radarChart = (option) ->
	option = $.extend
		# データ取得関数
		data: (RaderChart) ->
			# Canvasのdata-values属性をカンマ区切りの数値として取得(グループ区切りは|)
			return RaderChart.dataParser $(@).data('values')
	, option

	@each ->
		unless @nodeName.toLowerCase() is 'canvas'
			return
		$this = $ @

		# 半径に指定が無ければ要素の幅もしくは高さから検出
		option.radius ?= Math.min($this.width(), $this.height()) / 2

		# データの取得
		data = if $.isFunction option.data
			option.data.call @, RaderChart
		else
			if $.isArray option.data[0]
				data = option.data
			else
				data = [option.data]

		if @getContext # Canvas Support

			# canvasのコンテキスト
			ctx = @getContext '2d'

			# レーダーチャートの生成
			chart = new RaderChart ctx, option

		else

			chart = new RaderChartSVG @, option

		chart.add data
		chart.draw()

		return