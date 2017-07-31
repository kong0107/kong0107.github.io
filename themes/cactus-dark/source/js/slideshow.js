$(".slideshow").each(function() {
    var counter = 0;
    var images = $("img", this);
    images.hide();
    setInterval(function() {
        images.hide();
        $(images[counter]).show();
        counter = (counter + 1) % images.length;
    }, 1500);
});

$(".thumbnail-container").each(function() {
    var self = $(this);
    self.children().not(".poster").hide();
    self.mouseover(function() {
        console.log($("video", this));
    });
});
