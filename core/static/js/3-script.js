/*!
 * Created by mario on 15/05/14.
 */
// Can also be used with $(document).ready()
$(window).load(function () {
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
});