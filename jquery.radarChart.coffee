###
* jquery.radarChart.js
* Author: Yusuke Hirao [http://www.yusukehirao.com]
* Version: 0.1.2.0
* Github: https://github.com/YusukeHirao/jquery.radarChart.js
* Licensed under the MIT License
* Require: jQuery v@1.9.1
###

'use strict'

w = @
$ = w.jQuery

debug = (obj) ->
	res = []
	for k, v of obj
		res.push "#{k}: #{v}"
	return res.join '\n'

class Polygon
	ctx: null
	sides: 3
	interiorAngle: 0
	x: 0
	y: 0
	radius: 100
	rotate: 270
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
	peint: ->
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
		if @strokeStyle and @strokeStyle isnt 'none'
			ctx.strokeStyle = @strokeStyle
			ctx.stroke()
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
		return @

	# 各頂点を二次元配列で返す
	# @return {Array}
	# @return {Polygon}
	getApexes: ->
		apexes = []
		for i in [0..@sides]
			apexes.push @getApex i
		return apexes

	# 頂点の座標を返す
	# @param {Number} i (時計回りで)i番目の頂点
	# @return {Array}
	getApex: (i) ->
		rad = @rotate * Math.PI / 180
		to = rad + @interiorAngle * i
		x = @x + Math.cos(to) * @radius
		y = @y + Math.sin(to) * @radius
		return [x, y]

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

$.fn.radarChart = (option) ->
	o = $.extend
		radius: null
		plotLineColor: 'red'
		plotLineWidth: 3
		plotBGColor: 'rgba(255, 0, 0, 0.2)'
		gridLength: 5
		gridLineColor: '#ccc'
		gridLineWidth: 1
		gridBorderColor: null
		gridBorderWidth: 3
		gridBGColor: '#fff'
		gridDivisionStep: 1
		fontColor: '#000'
		font: 'bold 13px Arial'
		offsetX: 0
		offsetY: 0
		scale: 1
		# データを取得する関数のデフォルト
		data: ->
			# Canvasのdata-values属性をカンマ区切りの数値として取得
			text = $(@).data('values') or ''
			return text.split(',')
	, option

	# 特に指定しなければ gridLineColor と同じにする
	o.gridBorderColor ?= o.gridLineColor

	@each ->
		unless @nodeName.toLowerCase() is 'canvas'
			return
		$this = $ @

		# 数値情報
		scale = o.scale
		radius = o.radius * scale or $this.width() / 2 * scale
		plotLineWidth = o.plotLineWidth * scale
		gridLineWidth = o.gridLineWidth * scale
		gridBorderWidth = o.gridBorderWidth * scale
		font = (o.font or '').replace /\d+/i, (d) -> d * scale
		offsetX = o.offsetX * scale
		offsetY = o.offsetY * scale

		# データの取得
		data = o.data.call @
		dataLength = data.length

		# 取得したデータによって頂点を決める
		if dataLength < 3
			# 従って、頂点が3以下はチャート生成ができないので、ここで終了する
			return

		# canvasのコンテキスト
		ctx = @getContext '2d'

		# 中心の座標
		cX = radius + offsetX
		cY = radius + offsetY

		# 目盛の高さ
		divisions = radius / o.gridLength

		# グリッドの生成
		i = o.gridLength
		ctx.font = font
		while i
			grid = new Polygon ctx, dataLength, divisions * i, cX, cY
			if i is o.gridLength
				# 外枠の線と背景色の描画
				grid.stroke(o.gridBorderColor, gridBorderWidth).fill(o.gridBGColor).peint()
				# 放射状線の描画
				grid.stroke(o.gridLineColor, gridLineWidth / 2).radiate()
			else
				if not (i % o.gridDivisionStep)
					# 目盛線の描画
					grid.stroke(o.gridLineColor, gridLineWidth).peint()
			i -= 1

		# データをプロット
		ctx.beginPath()
		for value, i in data
			value = parseFloat $.trim value
			point = divisions * value
			pentagon = new Polygon null, dataLength, point, cX, cY
			apex = pentagon.getApex i
			if i is 0
				ctx.moveTo apex[0], apex[1]
			else
				ctx.lineTo apex[0], apex[1]
		ctx.lineWidth = plotLineWidth
		ctx.strokeStyle = o.plotLineColor
		ctx.fillStyle = o.plotBGColor
		ctx.closePath()
		ctx.stroke()
		ctx.fill()

		# 目盛数値の描画
		i = o.gridLength + 1
		fontOffsetX = -11
		fontOffsetY = 8
		while i
			i -= 1
			ctx.fillStyle = o.fontColor
			ctx.strokeStyle = o.gridBGColor
			ctx.fillText "#{i}", cX + fontOffsetX, cY - divisions * i + fontOffsetY
		return