class Api {

  constructor(site_name, base_url) {
    this.site_name = site_name
    this.base_url = base_url
  }

  static all(callbackFn) {
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000//api/v1/base_urls',
      contentType: 'application/json',
      dataType: 'json',
      success: function(response) {
        callbackFn(response)
      }
    })
  }

  static individualApiCall(callbackFn, baseId) {
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000//api/v1/base_urls/${baseId}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(response) {
        callbackFn(response)
      }
    })
  }

  static callActualApi(baseUrl, mainPath, callbackFn) {
    $.ajax({
      type: 'GET',
      url: `${baseUrl}${mainPath}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(response) {
        callbackFn(response)
      }
    })
  }

  static addApi(values) {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/v1/zoos',
      contentType: 'application/json',
      dataType: 'json',
      data: values,
      success: function(response) {
        ZooView.addZoosToDom(response)
        Zoo.all(Zoo.refreshMap)
      }
    })
  }


  static mainPathRender(response) {
    if (response.constructor === Array) {
      Api.renderArray(response)
    } else if (response.constructor === Object) {
      var results = response.results
      Api.renderArray(results, response.next)
    }
  }

  static renderArray(array, nextLink) {
    var html = `<p><a href=${nextLink}>Next</a></p>`
    html += "<ul>"
    array.forEach((el) => {
      // if String or Object {} (object is length of 1 or 0 or more than 1)
      // if string call ajax on string to get name/second element of response and also make a listener immmediately
      // if object w/ length > 1 get url key do string actions
      //  if object 0 length do nothing
      // if object 1 get 0 index/ singular key. Check if key is a string or a link string
      var name = ""

        if (el.name.length > 0) {
          name = el.name
        } else {
         name =  Api.getName(el)
       }

      if (typeof el === 'string' && el.startsWith("https://")) {
        html += `<li><a href="#" class="sub-link">${name}</a></li>`
        createSubLinksListeners(el)

      } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length > 1)) {
        var url = el["url"]
        html += `<li><a href="#" class="sub-link">${name}</a></li>`
        createSubLinksListeners(url)

      } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length === 1)) {
        html += `<li><a href="#" class="sub-link">${name}</a></li>`
        createSubLinksListeners(el)

      } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length === 0)) {

      } else { //pure string that is not a link
        html += `<li>${el}</li>`
      }
    })

    html += "</ul>"
    $("#main-body").html(html)
  }

  static callSubLinks(target_url, callbackFn) {
    $.ajax({
      type: 'GET',
      url: target_url,
      contentType: 'application/json',
      dataType: 'json',
      success: function(response) {
        callbackFn(response)
      }
    })
  }

  static getName(response) {
    var arr = Object.values(response)
    arr.shift()
    var longest = arr.reduce(function (a, b) { return a.length > b.length ? a : b; });
    if (response.name.length === 0) {
      return longest
    } else {
      return response.name
    }
  }

}
