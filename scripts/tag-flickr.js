'use strict';

// Origin: https://github.com/visioncan/hexo-tag-flickr

var https = require('https');
var Promise = require('bluebird');
var hexoUtil = require('hexo-util');
var tagUtil = require('./flickrTagUtil');
var APIKey = hexo.config.flickr_api_key || false;


/**
 * promise Flickr API request
 * @param  {Array} tagArgs Tag args ex: ['15905712665', 'z']
 * @resolve {Object} image attrs
 */
var promiseRequest = function (tagArgs) {
  if (!APIKey) {
    throw new Error('flickr_api_key configuration is required');
  }

  var tag = tagUtil.convertAttr(tagArgs);

  return new Promise(function (resolve, reject) {
    var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo' +
      '&api_key=' + APIKey +
      '&photo_id=' + tag.id +
      '&format=json' +
      '&nojsoncallback=1';

    https.get(url, function (res) {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        var json = JSON.parse(data);
        if (json.stat === 'ok') {
          resolve(tagUtil.imgFormat(tag, json));
        } else {
          return reject('Flickr Tag Error: ' + tag.id + ' ' +  json.message);
        }
      });

    }).on('error', function (e) {
      return reject('Fetch Flickr API error: ' + e);
    });
  });

};


/**
 * Filckr tag
 *
 * Syntax:
 * ```
 * {% flickr [class1,class2,classN] photo_id [size] %}
 * ```
 */
hexo.extend.tag.register('flickr', function (args, content) {
  return promiseRequest(args).then(function (imgAttr) {
    var href = imgAttr.info.urls.url[0]._content;
    for(var a in imgAttr) if(typeof imgAttr[a]=="object") delete imgAttr[a];
    return hexoUtil.htmlTag(
        "a",
        {href: href},
        hexoUtil.htmlTag('img', imgAttr, null, false),
        false
    );
  }, function (err) {
    hexo.log.error(err);
  });
}, {async: true});

hexo.extend.tag.register("flickr_ext", function(args) {
    return promiseRequest(args).then(function(attr) {
        var html = "";
        var imgAttr = {};
        for(var a in attr) if(typeof attr[a] != "object") imgAttr[a] = attr[a];

        attr.info.description.parsed.forEach(function(para) {
            if(typeof para == "string")
                html += hexo.render.renderSync({text: para, engine: "markdown"});
        });
        html = hexoUtil.htmlTag("header", {}, attr.alt, false) + html;
        html = hexoUtil.htmlTag("figcaption", {}, html, false);
        html = hexoUtil.htmlTag(
            "a",
            { href: attr.info.urls.url[0]._content },
            hexoUtil.htmlTag("img", imgAttr),
            false
        ) + html;
        return hexoUtil.htmlTag("figure", {}, html, false);
    }, err => hexo.log.error(err));
}, {async: true});


/**
 * For gallery post
 *
 * Syntax:
 * ```
 * photos:
 * - flickr photo_id [size]
 * - flickr photo_id [size]
 * ```
 */

hexo.extend.filter.register('pre', function(data) {
    var promises = [];

    if(data.photos) promises.push(
        Promise.map(data.photos, function(photo) {
            var photoTag = photo.split(' ');
            if (photoTag[0] !== 'flickr') return photo;
            return promiseRequest(photoTag.slice(1)).then(
                imgAttr => imgAttr.src,
                err => hexo.log.error(err)
            );
        }).then(results => ({photos: results}))
    );
    if(data.gallery) promises.push(
        Promise.map(data.gallery, function(photo) {
            if(typeof photo != "string") return photo;
            var photoTag = photo.split(' ');
            if (photoTag[0] !== 'flickr') return photo;
            return promiseRequest(photoTag.slice(1)).then(
                imgAttr => imgAttr,
                err => hexo.log.error(err)
            );
        }).then(results => ({gallery: results}))
    );
    if(data.og && data.og.image) promises.push(
        Promise.map(data.og.image, function(image) {
            var photoTag = image.split(' ');
            if (photoTag[0] !== 'flickr') return image;
            return promiseRequest(photoTag.slice(1)).then(
                imgAttr => imgAttr.src,
                err => hexo.log.error(err)
            );
        }).then(results => Object.assign(data.og, {image: results}))
    );

    return Promise.all(promises).then(function(arr) {
        arr.forEach(function(obj) {
            Object.assign(data, obj);
        });
    });
});
