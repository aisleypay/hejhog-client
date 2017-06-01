class ApiView {

// rendering the site names onto the homepage of the APIs saved in our database
  static render(response) {
    var html = "<div class=\"results\">"

    $.each(response, function(index, api) {
      var individual = `<a id=${api.id} class="api-base-link" href="#"> ${api.site_name}</a>`
      html += individual
    })

    html += "</div>"
    $("#existing-api-links").html(html)
    createApiListeners()
  }

// build nav bar with choosen API's main_paths
  static buildNavBar(response) {
    // debugger
    let navBarPaths

    if (response.main_paths.length != 0) {
      navBarPaths = response.main_paths
      var html = ""

      navBarPaths.map((path, index) => {
        var new_header = path.main_branch.slice(0, -1)
        var cap_header = new_header.charAt(0).toUpperCase() + new_header.slice(1)
        html += `<li><a href='#' id=${path.main_branch} class='main-path' data-url="${response.base_url}">${cap_header}</li>`
      })
    } else {

      Api.callSubLinks(response.base_url, Api.mainPathRender)
    }

    $("#api-main-paths").html(html)
  }

  static clearNavBar(){
    $("#api-main-paths").html("")
  }


}
