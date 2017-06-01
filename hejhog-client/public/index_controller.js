$(document).ready(function() {
  getAPI()
  returnHome()
})

// loads from our API, APIs in database
function getAPI() {
  Api.all(ApiView.render)
}

// attaches listeners to create navbar on API links loaded from our database on the homepage
function createApiListeners() {
  $(".api-base-link").click(function(e) {
    var baseId = this.id

    Api.individualApiCall(ApiView.buildNavBar, baseId)
  })
}

// create listeners for nav bar
function createMainPathListeners(baseUrl) {
  $(".main-path").click(function(e) {
    var mainPath = this.id
    Api.callApiMainPath(baseUrl, mainPath, Api.mainPathRender)
  })
}

// creates listeners for all links in the #existing-api-links div with a class of .sub-link
function createSubLinksListeners() {
  $(".sub-link").click(function(e) {
    $("#existing-api-links").html("")

    var url = this.dataset.url
    Api.callSubLinks(url, Api.mainPathRender)
  })
}

function returnHome(){
  $("a.navbar-brand").click(function(e){
    ApiView.clearNavBar()
    getAPI()
  })
}
