mergeConfig({
	setting: {
		"common.locale": "zh_CN",
		"widget.skin": "modern"
	},
	patterns: {
		"js": {
			contentType: "text/javascript",
			charset: "UTF-8",
			url: ">${fileName}.js"
		},
		"css": {
			contentType: "text/css",
			charset: "UTF-8",
			url: ">${fileName}.css"
		}
	},
	packages: {
		"analog-clock": {
			pattern: "js",
			fileName: "devAnalogClock-v1.1/js/swfobject"
		},
		"calendar.skin": {
			pattern: "css",
			fileName: "fullcalendar/fullcalendar,fullcalendar/cupertino/theme"
		},
		"calendar": {
			pattern: "js",
			fileName: "fullcalendar/fullcalendar",
			depends: "jquery,calendar.skin"
		},
		"common-type": {
			pattern: "js",
			fileName: "data/common-types"
		},
		"custom-common": {
			pattern: "js",
			fileName: [
				"/dorado/custom/custom_common_methods",
				"/dorado/custom/custom_common_enum",
			]
		},
		"echarts": {
			pattern: "js",
			fileName: [
				"/dorado/scripts/echarts/echarts.min",
			]
		},
		"jquery-form":{
			pattern:"js",
			fileName:[
				"/Db/js/addones/jquery.form"
			]
		}
	}
});