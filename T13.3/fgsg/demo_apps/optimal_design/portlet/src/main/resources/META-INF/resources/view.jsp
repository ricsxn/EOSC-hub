<%@ include file="/init.jsp" %>

<!-- Title -->
<h3>Optimal Design</h3>
<hr align="left" width="40%">

<!-- main interface -->
<div id="main">
</div>

<script type="text/javascript">
function build_gui() {
  var guiContent =
	"<p>This interface allows to access the Optimal Design interface currently hosted at <a href=\"https://cloud.garr.it\">GARR Cloud platform</a></p>" +
	"<ul>" +
	"<li><a href=\"http://90.147.189.195/dbmgr/dashboard\">Running dashboard</a></li>" +
	"<li><a href=\"http://90.147.189.195\">List of previous and current run directories</a></li>" +
	"</ul>" +
	"<p>Inside each run directory, it is possible to view the input dataset, watch the chromosome evolution graph and access the following actions:" +
	"<ul>" +
	"<li><strong>Statistics</strong> Details about the execution statistics</li>" +
	"<li><strong>Run directories</strong> Directories used to compute single chromosomes for each generation</li>" +
	"<li><strong>Chromosome evolution</strong> Access the image showing the winning chromosome history</li>" +
	"<li><strong>Data dir</strong> Go back to data dir</li>" +
	"</ul></p>" +
	"<small>The principal purpose of this application is for security, grant SSO access and accounting purposes</small>";

  $("#main").html(guiContent);
}

$(document).ready(function() {
  console.log('log ' + themeDisplay.isSignedIn());
  if(!themeDisplay.isSignedIn()) {
    $("#main").html('<div class="alert alert-danger" role="alert">' +
                    'You must sing-in to access this application' +
                    '</div>');
  } else if(!fg_api_settings.enabled) {
      $("#main").html('<div class="alert alert-danger" role="alert">' +
                      'FG API Server is not reachable, please contact the portal administrator' +
                      '</div>');

    } else if(fg_user_info.user_exists == "false") {
      $("#main").html('<div class="alert alert-danger" role="alert">' +
                      'You need to be registered in Futuregateway to access this applciation interface' +
                      '</div>');
    } else {
      build_gui();
    }
});
</script>
