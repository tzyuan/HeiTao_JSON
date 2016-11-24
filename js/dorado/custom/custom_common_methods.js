//资金流入类型
function order_from_format(_this) {
	if (_this != undefined) {
		_this = parseInt(_this);
		switch (_this) {
			case 1:
				return '淘宝';
			case 2:
				return '支付宝';
			case 3:
				return '其他';
		}
	}
	return '';
}
//订单状态
function order_status_formate(_this) {
	for (var i = 0; i < order_status_Tree_nodes.length; i++) {
		if (order_status_Tree_nodes[i].userData.value == _this) {
			return order_status_Tree_nodes[i].label;
		}
	}
	return '';
	//	if (_this != undefined) {
	//		switch (_this) {
	//			case 'TRADE_FINISHED':
	//				return '交易成功结束';
	//			case 'TRADE_CLOSED':
	//				return '交易中途关闭（未完成）';
	//			case 'TRADE_REFUSE':
	//				return '即时到账交易已拒绝';
	//		}
	//	}
	//	return _this;
}

function type_format(_this) {
	//0:未知,1:运费险,2:实付金额,3:聚划算佣金,4:淘宝客佣金代扣款,5:代扣返点积分,6:天猫佣金,7:信用卡支付服务费,8:花呗支付服务费
	if (_this != undefined) {
		_this = parseInt(_this);
		switch (_this) {
			case 0:
				return '未知';
			case 1:
				return '运费险';
			case 2:
				return '实付金额';
			case 3:
				return '聚划算佣金';
			case 4:
				return '淘宝客佣金代扣款';
			case 5:
				return '代扣返点积分';
			case 6:
				return '天猫佣金';
			case 7:
				return '信用卡支付服务费';
			case 8:
				return '花呗支付服务费';
		}
	}
	return '';
}

function in_out_type_format(_this) {
	if (_this != undefined) {
		switch (_this) {
			case 'in':
				return '收入';
			case 'out':
				return '支出';
		}
	}
	return '';
}
//订单类型format方法
function order_type_format(_this) {
	if (_this != undefined) {
		switch (_this) {
			case 'TRADE':
				return '交易';
			case 'CAE_R':
				return 'CAE代发';
			case '_OTHERS':
				return '其他';
			case 'CAE':
				return 'CAE代扣';
		}
	}
	return '';
}

/* 在文本框显示带checkbox的下拉菜单树已选项的文本*/
function tree_checked_text(self, arg) {
	var text = '',
		checkedNodes = self.getCheckedNodes();
	for (var i = 0; i < checkedNodes.length; i++) {
		text += checkedNodes[i].get('label') + ',';
	}
	text = text.substr(0, text.length - 1);
	self.get('parent.editor').doSetText(text);
}

//获取下拉菜单里选中的UserData
function getTreeData(toolBar, id) {
	var data = toolBar.get('items.' + id).get('trigger.control').getCheckedNodes(),
		str = '';
	for (var i = 0; i < data.length; i++) {
		str += data[i].get('userData').value + ',';
	}
	str = str.substr(0, str.length - 1);
	return str == '' ? undefined : str;
}