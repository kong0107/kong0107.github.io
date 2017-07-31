$(".thumbnail-container").each(function() {
    var self = $(this);
    var gallery = self.children(".gallery")[0];
    var video = self.children("video")[0];
    var intervalID = 0;
    self.children().not(".poster").hide();
    self.mouseover(function() {
        if(video) {
            $(video).show();
            video.play();
            return;
        }
        if(gallery) {
            var photos = $(gallery).children("img");
            $(gallery).show();
            intervalID = setInterval(function() {
                photos.hide();
                var pi = (parseInt(gallery.dataset.posterIndex) + 1) % photos.length;
                $(photos[pi]).show();
                gallery.dataset.posterIndex = pi;
            }, 1000);
        }
    });
    self.mouseout(function() {
        if(video) {
            video.pause();
            return;
        }
        if(gallery && intervalID) {
            clearInterval(intervalID);
            intervalID = 0;
        }
    });
});
