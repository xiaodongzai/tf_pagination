/**
 * @file 文件说明
 * @author XieZhendong
 * @date 15/8/7
 */

$.fn.tfPagination = function () {
    var pagination = $(this),
        pageSizePanel = pagination.find('.size-select');

    //设置默认值
    var params = {
        totalCount: 10,
        currentPage: 1,
        currentPageSize: 10,
        maxLabelNumber: 5,
        handler: function () {
        }
    };

    //根据传入参数设置params
    var len = arguments.length;
    if (len > 0) {
        var paramsTemp = arguments[0];
        for (var key in paramsTemp) {
            if (key === 'handler' && typeof paramsTemp[key] == 'function') {
                params[key] = function(){
                    paramsTemp[key].call(this,params.currentPage,params.pageSize);
                }
            }
            else {
                if (paramsTemp[key])
                    params[key] = parseInt(paramsTemp[key], 10);
            }
        }
    }

    //初始化分页控件
    var initPaginationWithParams = function (totalCount, currentPage, pageSize, labels) {
        //设置pageSize
        pageSizePanel.html(pageSize + '<i class="icon-triangle"></i>');
        var num = Math.ceil(totalCount / pageSize),
            html = '';
        html += '<div class="commonDiv pagination_area clearfix" data-pageSize="" data-currentPage=""><div class="data-bottom fn-fl fn-re"><div class=size-select>'+ params.pageSize +'<i class=icon-triangle></i></div><ul class=size-panel style="display: none;"><li>30<li>20<li>10</ul></div><div class="data-pagination fn-fr">';
        html += '<span  class="dp-type dp-type1 disabled">上一页</span>';
        if (num <= 0) {
            pagination.hide();
        } else {
            html += '<span class="dp-type dp-type2 active">1</span>';
            if (num == 1) {
                html += '<span class="dp-type dp-type1 disabled">下一页</span>';
            } else {
                var middle = Math.round(labels/2);
                if (num <= labels) {
                    for (var i = 2; i <= num; i++) {
                        html += '<span class="dp-type dp-type2">' + i + '</span>';
                    }
                } else {
                    //分为两部分循环
                    for (var i = 2; i <=labels; i++) {
                        if(i<middle){
                            html += '<span class="dp-type dp-type2">' + i + '</span>';
                        }else if(i==middle){
                            html += '<span class="dp-type dp-type3">' + '...' + '</span>';
                        }else{
                            html += '<span class="dp-type dp-type2">' + (num - labels + i) + '</span>';
                        }
                    }
                }
                html += '<span class="dp-type dp-type1">下一页</span>';
            }
        }
        html += '<input type="text" class="dp-type4 J_num" autocomplete="off"/>' +
        '<span class="dp-type dp-type5">Go</span>' +
        '<span class="dp-type6 J_totalCount">共' + totalCount + '条</span>';
        html += '</div></div>';
        pagination.empty().append($(html));
        activePaginationSpan(currentPage || 1, true);
    }

    //获取当前分页信息
    getPaginationInfo = function () {
        var obj = {};
        obj.pageSize = $('.size-select').text() || 10;
        obj.currentPage = $('.data-pagination .dp-type2.active').text() || 1;
        return obj;
    }

    //获取当前页码
    function getPaginationString() {
        var list = pagination.find('.dp-type2'),
            len = list.length,
            str = '';
        for (var i = 0; i < len; i++) {
            str += list.eq(i).text() + ',';
        }
        return str;
    }

    //获取应当展示的页码
    function activePaginationSpan(currentPage){
        var totalCount = params.totalCount,
            maxLabelNum = params.maxLabelNumber,  //最多展示的label
            num = Math.ceil(totalCount / params.pageSize), //页数
            middleNumber = Math.round(num/2),
            middleLabelIndex = Math.round(maxLabelNum/2),
            labelArr = pagination.find('.dp-type'),
            currentLabel = null;
            labelArr.each(function (i, v) {
                var This = $(v);
                if (This.text && This.text() == currentPage) {
                    currentLabel = This;
                }
            });
        if(currentLabel==null){

            function setLabel(i){
                labelArr.eq(middleLabelIndex-1*i).text(labelArr.eq(middleLabelIndex-2*i).text()/1+1*i).addClass('dp-type2');
                labelArr.eq(middleLabelIndex+1*i).text(currentPage).addClass('dp-type2');
                labelArr.eq(middleLabelIndex).text('...').addClass('dp-type3').removeClass('dp-type2');
                currentLabel = labelArr.eq(middleLabelIndex+1*i);
            }

            if((currentPage+1)==labelArr.eq(middleLabelIndex+2).text()){
                setLabel(1);
            }else if((currentPage-1)==labelArr.eq(middleLabelIndex-2).text()){
                setLabel(-1);
            }
            else{
                currentLabel = labelArr.eq(middleLabelIndex);
                currentLabel.text(currentPage).addClass('dp-type2');
                currentLabel.prev().text("...").addClass('dp-type3').removeClass('dp-type2');
                currentLabel.next().text("...").addClass('dp-type3').removeClass('dp-type2');
            }
        }

         currentLabel.addClass('active').siblings().removeClass('active');

        params.currentPage = currentPage;

        //边界值判定
        var prevPageLabel = labelArr.eq(0),
            nextPageLabel = labelArr.eq(Math.min(maxLabelNum,num)+1);
        if(currentPage==1){
            prevPageLabel.addClass('disabled');
        }else{
            prevPageLabel.removeClass('disabled');
        }
        if(currentPage==num){
            nextPageLabel.addClass('disabled');
        }else{
            nextPageLabel.removeClass('disabled');
        }
        params.handler();
    }

    //点击页码
    $('body').delegate('.data-pagination .dp-type', 'click', function () {
        var _this = $(this),
            _active = pagination.find('.dp-type2.active'),
            _index = _active.text(),
            _prev = _index / 1 - 1,
            _next = _index / 1 + 1,
            text = _this.text();
        if (_this.hasClass('disabled'))
            return;
        switch (text) {
            case '上一页'://上一页
                activePaginationSpan(_prev);
                break;
            case '下一页'://下一页
                activePaginationSpan(_next);
                break;
            case 'Go': //搜索
                var value = pagination.find('.dp-type4').val() / 1,
                    list = $('.dp-type2'),
                    len = list.length,
                    maxPageSize = list.eq(len - 1).text() / 1;
                if (value <= 0 || value > maxPageSize) {
                    break;
                } else {
                    pagination.find('.dp-type4').val('');
                    activePaginationSpan(value);
                }
                break;
            case '...':
                break;
            default:
                activePaginationSpan(text);
                break;
        }
    });

    //初始化分页控件
    initPaginationWithParams(params.totalCount, params.currentPage, params.pageSize, params.maxLabelNumber);

    //选择页码
    pagination.delegate('.size-select','click', function () {
        var _this = $(this),
            pageSize = _this.text() / 1,
            bottom = 12 - (pageSize / 10 - 1) * 29;
        pagination.find('.size-panel').css('bottom', bottom + 'px');
        pagination.find('.size-panel').toggle();
    });

    pagination.delegate('.size-panel li','click', function () {
        var _this = $(this),
            pageSize = _this.text() / 1;
        pagination.find('.size-select').html(pageSize + '<i class="icon-triangle"></i>');
        pagination.find('.size-panel').toggle();
        params.pageSize = pageSize;
        params.currentPage = 1;
        initPaginationWithParams(params.totalCount,1,pageSize,params.maxLabelNumber);
    });
};