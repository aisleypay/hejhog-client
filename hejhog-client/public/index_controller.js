$(document).ready(function() {
  getAPI()
  returnHome()
  postNewApi()

  $("#about").click(function(e) {
    $("#existing-api-links").html("")

    var html = `<div id="about-content" class="container"><h1>About</h1>
                  <p>Hejhog is about making API navigation and customization easier for users. We hope that Hejhoj will be useful for anyone who wants to easily traverse an API, customize which parts of the API they want to use, and eventually construct either other APIs, store information is a user relavent context, and download relevant information. (for now) </p>
                <h1>Who We Are</h1>
                  <p>We are Andrea, Isaac, and Paisley! We are students at the Flatiron School for web development.</p>
                <h1>What is this Site?</h1>
                  <p>&nbsp;Currently, Hejhog has the ability to take in any API without authorization conditions and render out a readable user friendly version of that API. Additionally, upon submission, the user can customize to an extent which parts of the API are most important to them.</p>
                <h1>Future Goals</h1>
                  <p>We would like to make Hejhog a SquareSpace of sorts for APIs. The next immediate goal for development is make Hejhog capable of taking in APIs that require authorization.</p></div>`
    $("#existing-api-links").html(html)


  })
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
  $("#form").submit(function(event){
    event.preventDefault()
    Api.addApi()
  })
}

function checkBoxSubmit(lastId){
  $("#check-box-form").submit(function(event){
    event.preventDefault()
      var selected = [];
      $.each($("input[type='checkbox']:checked"), function(){
        selected.push($(this).val());
      });
      Api.getMainPaths(selected, lastId)
    })
  }

function deleteId(){
  $(".delete").click(function(){
    var id = $(this).attr('id')
    Api.deleteApi(id)
  })
}
