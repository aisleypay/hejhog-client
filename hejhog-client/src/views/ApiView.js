class ApiView {

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

  static individualApiRender(response) {
    ApiView.buildNavBar(response)
  }

  static buildNavBar(response) {
    let navBarPaths = response.main_paths
    var html = ""

    navBarPaths.map((path, index) => {
      var new_header = path.main_branch.slice(0, -1)
      var cap_header = new_header.charAt(0).toUpperCase() + new_header.slice(1)
      html += `<li><a href='#' id=${path.main_branch} class='main-path'>${cap_header}</li>`
    })
    $("#api-main-paths").html(html)

    createMainPathListeners(response.base_url)
  }

}
