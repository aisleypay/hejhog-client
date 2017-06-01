class Api {

  constructor(site_name, base_url) {
    this.site_name = site_name
    this.base_url = base_url
  }

// ajax call to retrieve all the API urls saved in our APIs database
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

// retrieve from database the main-paths of the API clicked on the homepage
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

// ajax call to retrieve JSON of clicked nav bar mainpath
  static callApiMainPath(baseUrl, mainPath, callbackFn) {
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

// builds and return html based on the passed in parameters
  static checkType(el, name, key) {
    var name = name || el.name
    var html = ""

    // if el is a string and a url
    if (typeof el === 'string' && ((el.startsWith("https://")) || (el.startsWith("http://")))) {
      if (key != undefined){
        html += `<li><a href="#" class="sub-link" data-url="${el}">${key}: ${name}</a></li>`
      } else {
        html += `<li><a href="#" class="sub-link" data-url="${el}">${name}</a></li>`
      }

    // if el is an object {} and it has more than 1 K-V pair
    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length > 1)) {
      if (el["url"] != undefined) {
        var url = el["url"]
        html += `<li><a href="#" class="sub-link" data-url="${url}">${name}</a></li>`
      } else {
        // if no url render our object
        for(var sKey in el) {
          html += Api.checkType(el[sKey], undefined, sKey)
        }
      }

    // if el is an object {} with a length of 1
    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length === 1)) {

      if (el["url"] != undefined) {
        html += `<li><a href="#" class="sub-link" data-url="${el["url"]}">${name}</a></li>`
      } else {
        html += `<li>${Object.keys(el).join()}: ${Object.values(el).join()}</li>`
      }

      // if el is an empty object
    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length === 0)) {
      // render nothing
      // if the el is an Array
    } else if (Object.prototype.toString.call(el) === '[object Array]') {

      // if array element is an object
      el.forEach(function(el2) {
        html += "<ul>"
        for(var sKey in el2) {
          html += `${sKey}`
          html += Api.checkType(el2[sKey], undefined, sKey)
        }
        html += "</ul>"
      })

      // id el is a string that is not a url
    } else {
      if (key != undefined){
        html += `<li>${key}: ${el}</li>`
      } else {
        html += `<li>${el}</li>`
      }
    }

    return html
  }

// determine what kind of JSON object is the return value of whatev mainpath was clicked from the nav bar
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

//render to  #existing-api-links div the result of ajax mainpath call
  static renderArray(response, nextLink, backLink) {
    var html = `<p><a href="#" class="sub-link" data-url="${backLink}">Back</a></p>`
    html += `<p><a href="#" class="sub-link" data-url="${nextLink}">Next</a></p>`
    html += "<ul>"

// iterate through each el in the response response
    response.forEach((el) => {
      html += Api.checkType(el, name)
    })

    html += "</ul>"
    $("#existing-api-links").html(html)
    createSubLinksListeners()
  }

//render to  #existing-api-links div the result of ajax mainpath call if it is an object {}
  static renderObject(response) {
      $("#existing-api-links").html('<ul id="individual-resource"></ul>')
      var individualResoure = $("#individual-resource")

      for (var key in response) {
        var currVal = response[key]

        //if currVal is an Array
        if ((Object.prototype.toString.call(currVal) === '[object Array]')) {

          if (currVal.length === 0) {
            individualResoure.append(`<li>${key}: </li>`)

            // if currVal first element is an object {}
          }  else if (Object.prototype.toString.call(currVal[0]) === '[object Object]') {
            individualResoure.append(`<li>${key}: </li><ul id=${key}>`)

                currVal.forEach(function(el) {
                  var add
                  for(var subKey in el) {
                    add = Api.checkType(el[subKey], el.name, subKey)
                    $(`#${key}`).append(`${add}`)
                  }
                })

            individualResoure.append(`</ul>`)

          } else if (currVal[0].startsWith("https://")) {
            individualResoure.append(`<li>${key}: </li><ul id=${key}>`)
            var promiseArr = []

            currVal.forEach(function(el) {
                var promise = Api.callName(el)
                promiseArr.push(promise)
            })

            promiseArr.forEach(function(promise) {
              Api.handleData(promise, key)
            })

            individualResoure.append(`</ul>`)
          } else {
            individualResoure.append(`<li>${key}: </li><ul id=${key}>`)
            currVal.forEach(function(el){

              if ((el.startsWith("https://")) || (el.startsWith("http://"))) {
                var promise = Api.callName(el)
                Api.handleData(promise, key)
              } else {
                $(`${key}`).append(`<li>${el}</li>`)
              }

            })
              $(`${key}`).append(`</ul>`)
          }

          // if currVal is a string url
        } else if (typeof currVal === 'string' && ((currVal.startsWith("https://")) || (currVal.startsWith("http://")))) {
          var promise = Api.callName(currVal)
          Api.handleData(promise, key)

        } else {
          individualResoure.append(`<li>${key}: ${currVal}</li>`)
        }
      }

      createSubLinksListeners()
  }

// get data within passed in promise object
  static handleData(promise, key) {
    promise.then(function(realData) {
      var linkText = realData["name"] || realData["title"]
      $(`#${key}`).append(`<li><a href="#" class="sub-link" data-url="${realData["url"]}">${linkText}</a></li>`)
      createSubLinksListeners()
    })
  }

// ajax call to retrieve JSON for whatever target url was clicked in #existing-api-links
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

 // ajax call that returns promise object
  static callName(target_url) {
    return $.ajax({
      type: 'GET',
      url: `${target_url}`,
      contentType: 'application/json',
      dataType: 'json'
    })
  }

  static addApi() {

    var data = { base_url: {
                            site_name: $("#site-name").val(),
                            base_url: $("#new-base-url").val()
                          }
                }

    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/v1/base_urls',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(data),
      success: Api.getNewlyAddedApi(data.base_url.base_url)
    })
  }

  static getNewlyAddedApi(url){
    $.ajax({
      type: 'GET',
      url: url,
      contentType: 'application/json',
      dataType: 'json',
      success: function(response){
        console.log(response)
        var mainPaths = Object.keys(response)
        mainPaths.forEach( (path) => {
          console.log(path)
          var params = { main_path: { main_branch: path} }
          console.log(params)
          Api.addMainPathsToNewlyAddedApi(params)
        })
      }

    })
  }

  static addMainPathsToNewlyAddedApi(params){
    $.ajax ({
      type: 'POST',
      url: 'http://localhost:3000/api/v1/main_paths',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(params),
      success: getAPI()
    })
  }
}
