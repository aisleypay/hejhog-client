class Api {

  constructor(siteName, baseUrl) {
    this.siteName = siteName;
    this.baseUrl = baseUrl;
  }

  // ajax call to retrieve all the API urls saved in our APIs database
  static all(callbackFn) {
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000//api/v1/base_urls',
      contentType: 'application/json',
      dataType: 'json',
      success: (response) => {
        callbackFn(response);
      },
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
        callbackFn(response, `${baseUrl}${mainPath}`)
      },
      error: Api.callSubLinks(baseUrl, Api.mainPathRender)
    })
  }

  // builds and return html based on the passed in parameters
  static checkType(el, name, key) {
    var name = name || el.name || el.title
    var html = ""

    // if el is a string and a url
    if (key === "image_url") {
      html += (`<li class="list-group-item">${key}: <a href="${el}"><img src="${el}"></a> </li>`)

    // if el is a string and a url
      } else if (typeof el === 'string' && ((el.startsWith("https://")) || (el.startsWith("http://")))) {
        if (key != undefined) {
          html += `<li class="list-group-item"><a href="#" class="sub-link" data-url="${el}">${key}: ${name}</a></li>`
      } else {
        html += `<li class="list-group-item"><a href="#" class="sub-link" data-url="${el}">${name}</a></li>`
      }

      // if el is an object {} and it has more than 1 K-V pair
    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length > 1)) {
      if (el["url"] != undefined) {
        var url = el["url"]
        html += `<li class="list-group-item"><a href="#" class="sub-link" data-url="${url}">${name}</a></li>`
      } else {
        // if no url render our object
        for (var sKey in el) {
          html += Api.checkType(el[sKey], undefined, sKey)
        }
      }

      // if el is an object {} with a length of 1
    } else if ((Object.prototype.toString.call(el) === '[object Object]') && (Object.keys(el).length === 1)) {

      if (el["url"] != undefined) {
        html += `<li class="list-group-item"><a href="#" class="sub-link" data-url="${el["url"]}">${name}</a></li>`
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
        html += `<div>`
        for (var sKey in el2) {
          html += `${sKey}`
          html += Api.checkType(el2[sKey], undefined, sKey)
        }
        html += "</div>"
      })

      // id el is a string that is not a url
    } else {
      if (key != undefined) {
        html += `<li class="list-group-item">${key}: ${el}</li>`
      } else {
        html += `<li class="list-group-item">${el}</li>`
      }
    }

    return html
  }

  // determine what kind of JSON object is the return value of whatev mainpath was clicked from the nav bar
  static mainPathRender(response, currUrl) {
    if (response.constructor === Array) {
      Api.renderArray(response, undefined, undefined, currUrl)
    } else if (response.constructor === Object) {
      var results
      if (response.results != undefined) {
        results = response.results
        Api.renderArray(results, response.next, response.previous, currUrl)
      } else {
        Api.renderObject(response)
      }
    }
  }

  //render to  #existing-api-links div the result of ajax mainpath call
  static renderArray(response, nextLink, backLink, currUrl) {
    var html = ""
    if (((nextLink === undefined) || (nextLink === null)) && ((backLink === undefined) || (backLink === null))) {
      html += `<div id="searchForm" class="form-group">
                <form id="search" data-url="${currUrl}">
                  Input ID of object you would like to search: <input type="text" id="search-id" placeholder="ID">
                  <button type="submit" class="btn btn-primary">Submit</button>
                </form>
              </div>`
    } else {
      html += `<div id="pagination"><ul class="pager"><li class="previous"><a href="#" class="sub-link" data-url="${backLink}">Back</a></li><li class="next"><a href="#" class="sub-link" data-url="${nextLink}">Next</a></li></ul></div>`
    }

    html += '<div class="list-group">'

    // iterate through each el in the response response
    response.forEach((el) => {
      html += Api.checkType(el, name)
    })

    html += "</div>"
    $("#existing-api-links").html(html)
  }

  //render to  #existing-api-links div the result of ajax mainpath call if it is an object {}
  static renderObject(response) {
    $("#existing-api-links").html('<div id="individual-resource" class="list-group"></div>')
    var individualResource = $("#individual-resource")

    for (var key in response) {
      var currVal = response[key]

      //if currVal is an Array
      if ((Object.prototype.toString.call(currVal) === '[object Array]')) {

        if (currVal.length === 0) {
          individualResource.append(`<li class="list-group-item">${key}: </li>`)

          // if the key says says the url is an image just attach the url
        } else if (key === "image_url") {
          individualResource.append(`<li class="list-group-item">${key}: ${currVal}</li>`)

          // if currVal first element is an object {}
        } else if (Object.prototype.toString.call(currVal[0]) === '[object Object]') {
          individualResource.append(`<div class="list-group">${key}: <div id=${key} class="list-group-item"></div>`)

          currVal.forEach(function(el) {
            var add
            for (var subKey in el) {
              add = Api.checkType(el[subKey], el.name, subKey)
              $(`#${key}`).append(`${add}`)
            }
          })

          individualResource.append(`</div>`)

          // if first element is a url
        } else if (currVal[0].startsWith("https://")) {
          individualResource.append(`<div class="list-group">${key}: <div id=${key} class="list-group-item"></div>`)
          var promiseArr = []

          currVal.forEach(function(el) {
            var promise = Api.callName(el)
            promiseArr.push(promise)
          })

          promiseArr.forEach(function(promise) {
            Api.handleData(promise, key)
          })

          individualResource.append(`</div>`)
        } else {
          individualResource.append(`<div class="list-group">${key}: <div id=${key} class="list-group-item"></div>`)
          currVal.forEach(function(el) {

            if ((el.startsWith("https://")) || (el.startsWith("http://"))) {
              var promise = Api.callName(el)
              Api.handleData(promise, key)
            } else {
              $(`#${key}`).append(`<li class="list-group-item">${el}</li>`)
            }

          })
          $(`#${key}`).append(`</div>`)
        }

        // if currVal is a string url
      } else if (typeof currVal === 'string' && ((currVal.startsWith("https://")) || (currVal.startsWith("http://")))) {
        var promise = Api.callName(currVal)
        Api.handleData(promise, key)

      } else if (Object.prototype.toString.call(currVal) === '[object Object]') {
        individualResource.append(Api.checkType(currVal))
      } else {
        individualResource.append(`<li class="list-group-item">${key}: ${currVal}</li>`)
      }
    }
  }

  // get data within passed in promise object
  static handleData(promise, key) {
    promise.then(function(realData) {
      var linkText = realData["name"] || realData["title"]
      $(`#${key}`).append(`<li class="list-group-item"><a href="#" class="sub-link" data-url="${realData["url"]}">${linkText}</a></li>`)
    })
  }

  // ajax call to retrieve JSON for whatever target url was clicked in #existing-api-links
  static callSubLinks(target_url, callbackFn) {
    $.ajax({
      type: 'GET',
      url: `${target_url}`,
      contentType: "application/json",
      dataType: 'json',
      // headers: { "access-control-allow-origin": "*"},
      success: function(response) {
        callbackFn(response)
      }
    })
  }

  // call search form
  static callSearch(target_url, callbackFn, searchId) {
    $.ajax({
      type: 'GET',
      url: `${target_url}${searchId}`,
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
    var data = {
      base_url: {
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
      // success: Api.getNewlyAddedApi(data.base_url.base_url)
      success: Api.getNewBaseUrlId(data.base_url.base_url)
    })
  }


  static getNewBaseUrlId(url) {
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000/api/v1/base_urls/`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(response) {
        var last = response.pop()
        var lastId = last.id + 1
        Api.getNewlyAddedApi(lastId, url)
      }
    })
  }

  static getNewlyAddedApi(lastId, url) {
    $.ajax({
      type: 'GET',
      url: url,
      contentType: 'application/json',
      dataType: 'json',
      success: function(response) {
        var mainPaths = Object.keys(response)
        ApiView.renderCheckBoxForm(mainPaths)
        checkBoxSubmit(lastId)
      }
    })
  }

  static getMainPaths(paths, lastId){
        paths.forEach((path) => {
          var params = {
            main_path: {
              main_branch: path + '/',
              base_url_id: lastId
            }
          }
          Api.addMainPathsToNewlyAddedApi(params)
        })
      }

  static addMainPathsToNewlyAddedApi(params) {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/v1/main_paths',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(params),
      success: getAPI()
    })

    ApiView.clearForm()
    ApiView.clearCheckBoxForm()
  }

  static deleteApi(id){
    $.ajax({
      url: `http://localhost:3000/api/v1/base_urls/${id}`,
      type: 'DELETE',
      success: function(){
        getAPI()
      }
    })
  }
}
