// 获取 get 参数的函数
function QueryGET(TheName){
    var TheValue = "index";	// 设置默认显示页面
    var urlt = window.location.href.split("?");
    if(urlt.length > 1){
        var clearurl = urlt[1].split("#");
        var gets = clearurl[0].split("&");
        for(var i=0;i<gets.length;i++){
            var get = gets[i].split("=");
            if(get[0] == TheName){
                var TheValue = get[1];
                break;
            }
        }
    }
    return TheValue;
}
// 生成代码快的行号
function line_code(num){
    canvas = document.getElementById('line_num_canvas');
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
    }
    canvas.width = 70;
    canvas.height = 28;
    ctx.font = "16px Arial";
    ctx.textAlign = "right";	// 设置对齐方式
    ctx.fillStyle = "#888888";	// 设置填充颜色
    ctx.fillText(num, 65, 21);	// 设置字体内容，以及在画布上的位置
    var image = new Image();	// 返回图像
    return canvas.toDataURL("image/png");
}
// 调整元素尺寸函数
function resize_dom(){
    tb_width = $("#content").width() + 70;
    $("#toc-box").css("width",tb_width);
    t_height = $("#toc").height();
    if(t_height > (($(window).height()*0.8)-10)){
        $("#toc").css("height",(($(window).height()*0.8)-10));
    }else{
        $("#toc").css("height","auto");
    }
}
// 主体函数
$(document).ready(function(){
    hljs.initHighlightingOnLoad();	// 加载代码高亮库
    marked.setOptions({	// 设置 Markdown 转换时代码高亮函数
        highlight: function (code,lang) {
            return hljs.highlightAuto(code).value;
        }
    });
    var renderer = new marked.Renderer();
    renderer.image = function(href, title, text){	// 设置 Markdown 转换时图片的代码
        return '<div class="img-box"><img src="'+href+'" alt="'+text+'" /></div>';
    };
    renderer.link = function(href, title, text){	// 设置 Markdown 转换时链接的代码
        var reg = new RegExp("^[\\w\\-\\:]+$");	// 验证命名域
        if(reg.test(href)){
            return '<a href="index.html?name='+href+'" title="'+text+'">'+text+'</a>';
        }else if(title == "def"){
            return '<a  data-toggle="tooltip" data-placement="top" title="'+href+'">['+text+']</a>';
        }else{
            return '<a href="'+href+'" target="_blank title="'+text+'">'+text+'</a>';
        }
    };
    // 分析地址，获取源文件地址
    var dirurl="data";	// 设定源文件目录
    var name = QueryGET("name");
    var subnames = name.split(":");
    for(i in subnames){
        dirurl += "/" +subnames[i];
    };
    fileurl = dirurl + ".md";
    // 请求 Markdown 文件
    $.ajax({
        url:fileurl,
        async:true,
        dataType:"text",
        error:function(){
            $("#content").html('<h3>该页面可能还不存在哦～</h3><p>不信可以<a href="'+window.location.href+'">刷新</a>试一下~</p>');
        },
        success:function(markdownString){
            // 将转换好的内容写入页面
            $("#content").html(function(){
                return marked(markdownString,{ renderer: renderer,gfm: true,tables: true,breaks: false,pedantic: false,sanitize: false,smartLists: true,smartypants: false }).replace(/<p>\[TOC]<\/p>/i,'<div id="toc-box"><div class="menu"></div><div id="toc"></div></div>').replace(/<p><div/ig,'<div').replace(/<\/div><\/p>/ig,'</div>');
            });
            // 代码高亮加行号
            $('pre code').each(function(){
                var thecode = $(this).html().split('\n');
                var code = "";
                for(k in thecode){
                    if(Number(k) != (thecode.length-1)){
                        code +='<div class="code-line"><div class="line-num" style="background:url('+line_code(Number(k)+1)+') top right no-repeat;"></div>'+thecode[k]+'</div>';
                    }
                }
                $(this).html(code);
            });
            $('[data-toggle="tooltip"]').tooltip();	//对引用的链接启用工具提示
            // 设置页面标题
            pagetitle=$("#content").find(":header:first").text();
            if(pagetitle != ""){
                $("title").text(pagetitle + " - " + $("#header h1").text());
            }
            // 增加目录
            $('#toc').toc({
                'selectors': 'h1,h2,h3', //elements to use as headings
                'container': '#content', //element to find all selectors in
                'anchorName': function(i, heading, prefix) { //custom function for anchor name
                    return prefix+i;
                },
                'headerText': function(i, heading, $heading) { //custom function building the header-item text
                    return $heading.text();
                }
            });
            // 添加目录按钮内容
            $("#toc-box .menu").html('<span class="glyphicon glyphicon-list" aria-hidden="true"></span>');
            // 调整元素尺寸
            resize_dom();
            $(window).resize(function(){
                resize_dom();
            });
            // 添加目录按钮动作
            $("#toc-box .menu").click(function(){
                $("#toc").slideToggle();
            });
            $("#toc a").click(function(){
                $("#toc").hide();
            });
        }
    });
});