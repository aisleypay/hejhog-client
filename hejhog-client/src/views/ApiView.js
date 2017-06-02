class ApiView {

// rendering the site names onto the homepage of the APIs saved in our database
  static render(response) {
    var html = '<div class="list-group"><li class="list-group-item active">Pick An API to Explore</li>'

    $.each(response, function(index, api) {
      var individual = `<li class="list-group-item"><a id=${api.id} class="api-base-link" href="#"> ${api.site_name}</a></li>`
      html += individual
    })

    html += "</div>"
    $("#existing-api-links").html(html)
    createApiListeners()
  }

// build nav bar with choosen API's main_paths
  static buildNavBar(response) {
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

  static clearForm(){
    $("#form")[0].reset()
  }

  static renderCheckBoxForm(paths){
    var html = '<h3>Choose Paths to Include in API:</h3><br><form id="check-box-form">'
    paths.forEach((path) => {
      html += ApiView.getCheckBox(path)
    })
    html += '<br><input type="submit" id="check-box-submit">'
    html += '</form>'
    $("#check-boxes").html(html)
    return html
  }

  static getCheckBox(path){
    // create pre-checked boxes corresponding to main_paths values
    var html = path + ": <input id='main_path_checkbox' type='checkbox' value='"+`${path}`+"'checked><br>"
    $("#check-box-form").append(html)
    return html
  }

  static clearCheckBoxForm(){
    $("#check-boxes").html("")
  }



}
