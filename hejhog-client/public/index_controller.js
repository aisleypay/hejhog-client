$(document).ready(function() {
  getAPI()
  returnHome()
})

function getAPI() {
  Api.all(ApiView.render)
}

function createApiListeners() {
  $(".api-base-link").click(function(e) {
    var baseId = this.id

    Api.individualApiCall(ApiView.individualApiRender, baseId)
  })
}

function createMainPathListeners(baseUrl) {
  $(".main-path").click(function(e) {
    var mainPath = this.id

    // call ajax to get specific apis information rendered
    Api.callActualApi(baseUrl, mainPath, Api.mainPathRender)
  })
}

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
