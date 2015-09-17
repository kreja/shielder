var gui = require("nw.gui");

var win = gui.Window.get();

$(document).on("ready", function() {
	var $ui = {
		shielder: $('#shielder'),
		colorPicker: $('.color-picker'),
		picker: $('.minicolors') // 生成的选择器
	};

	var currentBg = $ui.shielder.css( "background-color" );
	var currentHeight = win.height;
	var hasOpenFlag = false; // 择色器已打开标志，防止重复打开

	var app = {
		/**
		 * 初始化
		 * @return {[type]} [description]
		 */
		init: function(){
			var ctx = this;
			console.log(111);

			// 菜单
			if (process.platform === "darwin"){
				var nativeMenuBar = new gui.Menu({type: "menubar"});
				nativeMenuBar.createMacBuiltin("Shielder",{
				    hideEdit: true,
				    hideWindow: true
				});

				win.menu = nativeMenuBar;
			}

			ctx.initColorPicker();
			ctx.setShortcut();
			ctx.bindEvent();
		},
		/**
		 * 绑定事件
		 * @return {[type]} [description]
		 */
		bindEvent: function(){
			var ctx = this;

			// 点击择色入口
			$(document).on('click', '.minicolors-swatch', function(){
				ctx.openPicker();
			});

			// 点击遮挡器主体
			$(document).on('click', '#shielder', function(e){
				if(e.target == e.currentTarget){
					ctx.closePicker();
				}
			});

			// 移进遮挡器
			$(document).on('mouseover', '#shielder', function(e){
				// 颜色选择器打开着，鼠标移到 shielder 上，背景不用透明
				if(e.target == e.currentTarget && !ctx.hasPickerOpened()){
					ctx.setBgTransparent();
				}
			});

			// 移出遮挡器
			$(document).on('mouseout', '#shielder', function(e){
				if(e.target == e.currentTarget){
					ctx.cancelBgTransparent();
				}
			});

			// 调整遮挡器大小
			win.on('resize', function(){
				ctx.cancelBgTransparent();
			});
		},
		/**
		 * 判断择色器是否已打开
		 * @return {Boolean} [description]
		 */
		hasPickerOpened: function(){
			// var pickerIsOpen = $ui.picker.hasClass('minicolors-focus'); // todo:: 取不到， why

			var minicolors = document.querySelector('.minicolors');
			var pickerIsOpen = minicolors.className.indexOf('minicolors-focus') > -1;

			return pickerIsOpen;
		},
		/**
		 * 颜色
		 * @return {[type]} [description]
		 */
		initColorPicker: function(){
			/**
			 * 初始化颜色选择器
			 */
			$ui.colorPicker.minicolors({
				control: 'wheel',
				defaultValue: rgb2hex(currentBg),
				inline: false,
				letterCase: 'lowercase',
				opacity: true,
				position: 'bottom left',
				change: function(hex, opacity) {
			        $ui.shielder.css({
		    			'background-color': hex,
		    			'opacity': opacity
		    		});
				},
				theme: 'default'
			});
		},
		/**
		 * 设置快捷键
		 */
		setShortcut: function(){
			var ctx = this;

			// 切换透明背景快捷键
			var toggleBgHotkey = {
				key: "Ctrl+T",
				active: function()
				{
					ctx.toggleBgTransparent();
				},
				failed: function(msg)
				{
					console.log(msg);
				}
			};

			var shortcut = new gui.Shortcut(toggleBgHotkey);

			gui.App.registerGlobalHotKey(shortcut);
		},
		/**
		 * 打开取色
		 * 取消透明，调整高度
		 * bug::点两次 minicolor-swatch 就不会变回短的高度了::在一开始判断，取色器已经打开就退出
		 * @return {[type]} [description]
		 */
		openPicker: function(){
			var ctx = this;

			if(hasOpenFlag){
				return;
			}

			hasOpenFlag = true;

			ctx.cancelBgTransparent(); 

			currentHeight = win.height;
			if(currentHeight < 235){
				win.height = 235;
			}
		},
		/**
		 * 关闭择色
		 * 刚关闭择色要取消透明
		 * @return {[type]} [description]
		 */
		closePicker: function(){
			var ctx = this;

			if(!hasOpenFlag){
				return;
			}

			hasOpenFlag = false;

			win.height = currentHeight;
			ctx.cancelBgTransparent();
		},
		/**
		 * 设为背景透明
		 */
		setBgTransparent: function(){
			$ui.shielder.addClass('transparent');
		},
		/**
		 * 取消背景透明
		 */
		cancelBgTransparent: function(){
			$ui.shielder.removeClass('transparent');
		},
		/**
		 * 切换背景透明
		 */
		toggleBgTransparent: function(){
			$ui.shielder.toggleClass('transparent');
		} 
	};

	app.init();
});

/**
 * rgb 转十六进制
 * @param  {[type]} rgb [description]
 * @return {[type]}     [description]
 */
function rgb2hex(rgb){
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
