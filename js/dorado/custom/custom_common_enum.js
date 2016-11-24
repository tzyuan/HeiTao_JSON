//构造订单类型枚举数组
var order_type_Tree_nodes = [{
	checkable: true,
	label: '交易',
	userData: {
		value: 'TRADE'
	}
}, {
	checkable: true,
	label: 'CAE代发',
	userData: {
		value: 'CAE_R'
	}
}, {
	checkable: true,
	label: '其他',
	userData: {
		value: '_OTHERS'
	}
}, {
	checkable: true,
	label: 'CAE代扣',
	userData: {
		value: 'CAE'
	}
}];
//构造订单状态类型枚举数组
var order_status_Tree_nodes = [{
	checkable: true,
	label: '交易成功结束',
	userData: {
		value: 'TRADE_FINISHED'
	}
}, {
	checkable: true,
	label: '交易中途关闭（未完成）',
	userData: {
		value: 'TRADE_CLOSED'
	}
}, {
	checkable: true,
	label: '即时到账交易已拒绝',
	userData: {
		value: 'TRADE_REFUSE'
	}
}, {
	checkable: true,
	label: '等待买家付款',
	userData: {
		value: 'WAIT_BUYER_PAY'
	}
}, {
	checkable: true,
	label: '支付宝收到买家付款，请卖家发货',
	userData: {
		value: 'WAIT_SELLER_SEND_GOODS'
	}
}, {
	checkable: true,
	label: '卖家已发货，买家确认中',
	userData: {
		value: 'WAIT_BUYER_CONFIRM_GOODS'
	}
}, {
	checkable: true,
	label: '创建交易给未认证或未激活的账户',
	userData: {
		value: 'TRADE_PENDING'
	}
}, {
	checkable: true,
	label: '即时到账交易取消',
	userData: {
		value: 'TRADE_CANCEL'
	}
}, {
	checkable: true,
	label: '交易被拒绝',
	userData: {
		value: 'TRADE_REFUND_DEALING'
	}
}, {
	checkable: true,
	label: '交易成功可以退款',
	userData: {
		value: 'TRADE_SUCCESS'
	}
}, {
	checkable: true,
	label: 'COD等待卖家发货',
	userData: {
		value: 'COD_WAIT_SELLER_SEND_GOODS'
	}
}, {
	checkable: true,
	label: 'COD等待买家签收付款',
	userData: {
		value: 'COD_WAIT_BUYER_PAY'
	}
}, {
	checkable: true,
	label: 'COD签收成功，等待系统打款给卖家',
	userData: {
		value: 'COD_WAIT_SYS_PAY_SELLER'
	}
}, {
	checkable: true,
	label: '等待签收确认',
	userData: {
		value: 'COD_WAIT_RECEIPT_CONFIRM'
	}
}, {
	checkable: true,
	label: '其他',
	userData: {
		value: '_OTHERS'
	}
}];
//构造费用类型枚举数组//0:未知,1:运费险,2:实付金额,3:聚划算佣金,4:淘宝客佣金代扣款,5:代扣返点积分,6:天猫佣金,7:信用卡支付服务费,8:花呗支付服务费
var cost_type_Tree_nodes = [{
	checkable: true,
	label: '未知',
	userData: {
		value: 0
	}
}, {
	checkable: true,
	label: '运费险',
	userData: {
		value: 1
	}
}, {
	checkable: true,
	label: '实付金额',
	userData: {
		value: 2
	}
}, {
	checkable: true,
	label: '聚划算佣金',
	userData: {
		value: 3
	}
}, {
	checkable: true,
	label: '淘宝客佣金代扣款',
	userData: {
		value: 4
	}
}, {
	checkable: true,
	label: '代扣返点积分',
	userData: {
		value: 5
	}
}, {
	checkable: true,
	label: '天猫佣金',
	userData: {
		value: 6
	}
}, {
	checkable: true,
	label: '信用卡支付服务费',
	userData: {
		value: 7
	}
}, {
	checkable: true,
	label: '花呗支付服务费',
	userData: {
		value: 8
	}
}];
//构造资金流入类型枚举数组
var fund_type_Tree_nodes = [{
	checkable: true,
	label: '收入',
	userData: {
		value: 'in'
	}
}, {
	checkable: true,
	label: '支出',
	userData: {
		value: 'out'
	}
}];
//构造订单来源类型枚举数组
var order_from_Tree_nodes = [{
	checkable: true,
	label: '淘宝',
	userData: {
		value: 1
	}
}, {
	checkable: true,
	label: '支付宝',
	userData: {
		value: 2
	}
}, {
	checkable: true,
	label: '其他',
	userData: {
		value: 3
	}
}];


//10203040506070
var processStatusNode = [{
	checkable: true,
	label: '待递交',
	userData: {
		value: 10
	}
}, {
	checkable: true,
	label: '已递交',
	userData: {
		value: 20
	}
}, {
	checkable: true,
	label: '部分发货',
	userData: {
		value: 30
	}
}, {
	checkable: true,
	label: '已发货',
	userData: {
		value: 40
	}
}, {
	checkable: true,
	label: '部分结算',
	userData: {
		value: 50
	}
}, {
	checkable: true,
	label: '已完成',
	userData: {
		value: 60
	}
}, {
	checkable: true,
	label: '已取消',
	userData: {
		value: 70
	}
}];



//10未确认 20待尾款 30待发货 40部分发货 50已发货 60已签收 70已完成 80已退款 90已关闭(付款前取消)
var tradeStatusNode = [{
	checkable: true,
	label: '未确认',
	userData: {
		value: 10
	}
}, {
	checkable: true,
	label: '待尾款',
	userData: {
		value: 20
	}
}, {
	checkable: true,
	label: '待发货',
	userData: {
		value: 30
	}
}, {
	checkable: true,
	label: '部分发货',
	userData: {
		value: 40
	}
}, {
	checkable: true,
	label: '已发货',
	userData: {
		value: 50
	}
}, {
	checkable: true,
	label: '已签收',
	userData: {
		value: 60
	}
}, {
	checkable: true,
	label: '已完成',
	userData: {
		value: 70
	}
}, {
	checkable: true,
	label: '已退款',
	userData: {
		value: 80
	}
}, {
	checkable: true,
	label: '已关闭',
	userData: {
		value: 90
	}
}];


// 担保交易类别
var guaranteeNode = [{
	checkable: true,
	label: '担保交易',
	userData: {
		value: 1
	}
}, {
	checkable: true,
	label: '非担保交易',
	userData: {
		value: 2
	}
}, {
	checkable: true,
	label: '非担保在线交易',
	userData: {
		value: 3
	}
}];


// 支付状态
var payStatusNode = [{
	checkable: true,
	label: '未付款',
	userData: {
		value: 0
	}
}, {
	checkable: true,
	label: '部分付款',
	userData: {
		value: 1
	}
}, {
	checkable: true,
	label: '已付款',
	userData: {
		value: 2
	}
}];