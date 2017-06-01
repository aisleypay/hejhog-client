$(document).ready(function() {
  getAPI()
  returnHome()
  postNewApi()
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

// listeners for nav bar
$("#api-main-paths").on("click", ".main-path", function(event) {
  var mainPath = this.id
  var url = this.dataset.url
  Api.callApiMainPath(url, mainPath, Api.mainPathRender)
})


// listeners for all links in the #existing-api-links div with a class of .sub-link
$("#existing-api-links").on("click", ".sub-link", function(event) {
  $("#existing-api-links").html("")

  var url = this.dataset.url
  Api.callSubLinks(url, Api.mainPathRender)
})

// listener for search bar
$("#existing-api-links").on("submit", "#search", function(event) {
  var burl = $("#search")[0].dataset.url
  var specificSearchId = $("#search-id").val()

  $("#existing-api-links").html("")
  Api.callSearch(burl, Api.mainPathRender, specificSearchId)
})

function returnHome(){
  $("a.navbar-brand").click(function(e){
    ApiView.clearNavBar()
    getAPI()
  })
}

function postNewApi(){
  $("#submit").click(function(event){
    event.preventDefault()
    Api.addApi()
  })
}
