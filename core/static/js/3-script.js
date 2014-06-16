/*!
 * Created by mario on 15/05/14.
 */
// Can also be used with $(document).ready()

var get_greater_height = function(objs) {
    var greater = 0;
    objs.each(function(i){
        var h = objs.eq(i).height();
        if (h > greater) { greater = h }
    });
    return greater;
};
var set_greater_height = function(objs, greater, el_height) {
    // el_height: Extra element height loaded after this script
    objs.each(function(i){
        this.style.height = (el_height + greater) + 'px';
    });
};


$('.flexslider-principal').flexslider({
    animation: "slide",
    slideshowSpeed: 5000,
    startAt: 0,
    slideshow: true
});
$('.flexslider-destaque').flexslider({
    animation: "slide",
    controlNav: "thumbnails",
    randomize: false,
    slideshow: false
});

// Detalhe
$('#flexslider-detalhe-thumb').flexslider({
    animation: "slide",
    controlNav: false,
    animationLoop: false,
    slideshow: false,
    itemWidth: 120,
    itemMargin: 5,
    asNavFor: '#flexslider-detalhe'
});
$('#flexslider-detalhe').flexslider({
    animation: "slide",
    controlNav: false,
    animationLoop: false,
    slideshow: false,
    sync: "#flexslider-detalhe-thumb"
});
