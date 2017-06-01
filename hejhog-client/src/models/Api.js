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
      url: 'http://localhost:3000/api/v1/base_urls/',
      contentType: 'application/json',
      dataType: 'json',
      data: values,
      success: function(response) {
        ZooView.addZoosToDom(response)
        Zoo.all(Zoo.refreshMap)
      }
    })
  }

  static checkType(el, name, key) {
    // debugger
    var name = name || el.name
    var html = ""

    if (typeof el === 'string' && ((el.startsWith("https://")) || (el.startsWith("http://")))) {
      if (key != undefined){
        html += `<li><a href="#" class="sub-link" data-url="${el}">${key}: ${name}</a></li>`
      } else {
        html += `<li><a href="#" class="sub-link" data-url="${el}">${name}</a></li>`
      }

    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length > 1)) {
      if (el["url"] != undefined) {
        var url = el["url"]
        html += `<li><a href="#" class="sub-link" data-url="${url}">${name}</a></li>`
      } else {
        for(var sKey in el) {
          html += Api.checkType(el[sKey], undefined, sKey)
        }
      }

    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length === 1)) {

      if (el["url"] != undefined) {
        html += `<li><a href="#" class="sub-link" data-url="${el["url"]}">${name}</a></li>`
      } else {
        html += `<li>${Object.keys(el).join()}${Object.values(el).join()}</li>`
      }

    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length === 0)) {
      // render nothing
    } else if (Object.prototype.toString.call(el) === '[object Array]') {
      el.forEach(function(el2) {
        for(var sKey in el2) {
          html += Api.checkType(el2)
        }
      })
    } else {
      if (key != undefined){
        html += `<li>${key}: ${el}</li>`
      } else {
        html += `<li>${el}</li>`
      }
    }

    return html
  }

  static mainPathRender(response) {
    if (response.constructor === Array) {
      Api.renderArray(response)
    } else if (response.constructor === Object) {
      var results
      if (response.results != undefined) {
        results = response.results
        Api.renderArray(results, response.next, response.previous)
      } else {
        Api.renderObject(response)
      }
    }
  }

  static renderArray(array, nextLink, backLink) {
    var html = `<p><a href="#" class="sub-link" data-url="${backLink}">Back</a></p>`
    html += `<p><a href="#" class="sub-link" data-url="${nextLink}">Next</a></p>`
    html += "<ul>"

    array.forEach((el) => {
      var name = Api.getName(el)
      html += Api.checkType(el, name)
    })

    html += "</ul>"
    $("#existing-api-links").html(html)
    createSubLinksListeners()
  }

  static renderObject(response) {
      $("#existing-api-links").html('<ul id="individual-resource"></ul>')

      for (var key in response) {

        if ((Object.prototype.toString.call(response[key]) === '[object Array]')) {

          if (response[key].length === 0) {
            $("#individual-resource").append(`<li>${key}: </li>`)

          }  else if (Object.prototype.toString.call(response[key][0]) === '[object Object]') {
            $("#individual-resource").append(`<li>${key}: </li><ul id=${key}>`)

                response[key].forEach(function(el) {
                  // debugger
                  for(var subKey in el) {
                    var add = Api.checkType(el[subKey], el.name, subKey)
                    $(`#${key}`).append(`${add}`)
                  }
                })

            $("#individual-resource").append(`</ul>`)
          } else if (response[key][0].startsWith("https://")) {
            $("#individual-resource").append(`<li>${key}: </li><ul id=${key}>`)
            var promiseArr = []

            response[key].forEach(function(el) {
                var promise = Api.callName(el)
                promiseArr.push(promise)
            })

            promiseArr.forEach(function(promise) {
              Api.handleData(promise, key)
            })

            $("#individual-resource").append(`</ul>`)
          } else {
            $("#individual-resource").append(`<li>${key}: </li><ul id=${key}>`)
            response[key].forEach(function(el){

              if ((el.startsWith("https://")) || (el.startsWith("http://"))) {
                var promise = Api.callName(el)
                Api.handleData(promise, key)
              } else {
                $(`${key}`).append(`<li>${el}</li>`)
              }

            })
              $(`${key}`).append(`</ul>`)
          }
        } else if (typeof response[key] === 'string' && ((response[key].startsWith("https://")) || (response[key].startsWith("http://")))) {
          var promise = Api.callName(response[key])
          Api.handleData(promise, key)

        } else {
          $("#individual-resource").append(`<li>${key}: ${response[key]}</li>`)
        }
      }

      createSubLinksListeners()
  }

  static handleData(promise, key) {
    promise.then(function(realData) {
      var linkText = realData["name"] || realData["title"]
      $(`#${key}`).append(`<li><a href="#" class="sub-link" data-url="${realData["url"]}">${linkText}</a></li>`)
      createSubLinksListeners()
    })
  }

  static callSubLinks(target_url, callbackFn) {
    $.ajax({
      type: 'GET',
      url: `${target_url}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(response) {
        callbackFn(response)
      }
    })
  }

  static callName(target_url) {
    return $.ajax({
      type: 'GET',
      url: `${target_url}`,
      contentType: 'application/json',
      dataType: 'json'
    })
  }

  static getName(response) {
    var name = ""

    if (response.hasOwnProperty("name") && response["name"] !== "") {
      name = response["name"]
    } else if (typeof response === 'string' && response.startsWith("https://")) {
      Api.callName(response).then(first => Api.getName(first)).then(sec => name = sec)
    } else {
      var arr = Object.values(response)

      if (arr[0].startsWith("http")) {
        arr.shift()
      }
      if (arr[0] === "") {
        var longest = arr.reduce(function(a, b) {
          return a.length > b.length ? a : b
        })
        name = longest
      } else {
        name = arr[0]
      }
    }

    return name
  }
}
