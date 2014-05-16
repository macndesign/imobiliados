/**
 * Created by mario on 15/05/14.
 */
// Can also be used with $(document).ready()
$(window).load(function () {
    $('.flexslider-principal').flexslider({
        animation: "slide",
        slideshowSpeed: 5000,
        startAt: 3,
        slideshow: true
    });
    $('.flexslider-destaque').flexslider({
        animation: "slide",
        controlNav: "thumbnails",
        randomize: false,
        slideshow: false
    });

});