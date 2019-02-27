/**************************************************************************
 * Copyright (c) 2011:
 * Istituto Nazionale di Fisica Nucleare (INFN), Italy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *     @author <a href="mailto:riccardo.bruno@ct.infn.it">Riccardo Bruno</a>(INFN)
 *     ****************************************************************************/
import $ from 'jquery';

function build_page() {
  
  var html = "";
  var dbgMessage = "123_afewfra";
  
  if(themeDisplay.isSignedIn()) {
      if(fg_user_info.err_message.length>0) {
          html = "<div class=\"error\"><p>" +
                 "<b>ERROR</b> " +
                 "Unable to retrieve information for user: '" + fg_user_info.name + "'; error: '" +
                 fg_user_info.err_message +
	         "'</p>";
	  return html;
      }

      check_user();
      check_app('r-studio');
      check_task('r-studio', show_task_info, err_task_info);
      html = dbgMessage +
             "<div class=\"info\"><p>This application instantiate an R-Studio platform reserved for the portal user.</p></div>" +
             "<div class=\"user_info\"></div>" +
             "<div class=\"app_info\"></div>" +
             "<div class=\"task_info\"></div>" +
             "";
  } else {
      html = "<div class=\"unauthorized_info\"><p>You have to sign-in to access this service.</p></div>";
  }
  return html;
}

function check_task(application, show_info, err_info) {

    $.ajax({
        type: "GET", 
        url: fg_api_settings.base_url + '/' +
             fg_api_settings.version  + '/users/' +
             fg_user_info.name + '/tasks?application=' +
             application,
        headers: {
            'Authorization': fg_user_info.access_token,
            //'Content-Type': 'application/json'
        },
        dataType: "json",
	crossDomain: true,
        success: function(data) {
	    // First show generic task info
	    show_info(data);
	    task_id = data.tasks[0].id;
	    // Take care of output files
	    $.ajax({
                type: "GET",
                url: fg_api_settings.base_url + '/' +
                     fg_api_settings.version  + '/users/' +
                     fg_user_info.name + '/tasks/' +
                     task_id,
                headers: {
                    'Authorization': fg_user_info.access_token,
                    //'Content-Type': 'application/json'
                },
                dataType: "json",
                crossDomain: true,
                success: function(data) {
                    var output_files_items="";
		    var resource_url="";
                    for(var i = 0; i < data.output_files.length; i++) {
                        var output_file = data.output_files[i];
                        output_files_items +=
                            "<li class=\"" + output_file.name + "\">" + output_file.url + "</li>";
			if(output_file.name == "rstudio.json")
                            resource_url = output_file.url;
                    }
                    $('.task_files').append(
                        "<ul>" + output_files_items + "</ul>" +
		        "<div class=\"rstudio_data\"></div>");
                    $.ajax({
                        type: "GET",
                        url: fg_api_settings.base_url + '/' +
                             fg_api_settings.version + '/' +
                             resource_url,
                        headers: {
                            'Authorization': fg_user_info.access_token,
                            //'Content-Type': 'application/json'
                        },
                        dataType: "json",
	                crossDomain: true,
                        success: function(data) {
			    var rstudio_host = 
				"http://fgsg.ct.infn.it:" +
		                data[0]['NetworkSettings']['Ports']['8787/tcp'][0]['HostPort'] +
				"/";
			    var rstudio_user = data[0]['Config']['Env'][0];
			    var rstudio_pass = data[0]['Config']['Env'][1];
                            $('.rstudio_data').append(
                                "<b>RStudio instance data</b><br/><ul>" +
                                "<p>" + JSON.stringify(data) +
                                "</p>" +
			        "<p>You can try to access the r-studio instance by clicking " +
				"<a href=\"" + rstudio_host + "\" target=\"_blank\">here</a>. " +
			        "Credentials to access the machine are:<ul>" +
				"<li>" + rstudio_user + "</li>" +
				"<li>" + rstudio_pass + "</li>" +
			        "</ul></p>");
			    
	                },
                        error: function(jqXHR, exception) {
                            $('.rstudio_data').append(
                                "<p>Error retriving output data. " +
                                "Please report this, by clicking <a href=\"\">here</a>");
                        }
                    });
                },
                error: function(jqXHR, exception) {
                    $('.task_files').append(
                        "<p>Error retrieving output files of task: '" + data.id + "'" +
                        " Please notify the administrator, by clicking <a href=\"\">here</a>" +
                        "<p>");
                }
            });
	},
        error: function(jqXHR, exception) {
            err_info(jqXHR, exception);
	}
    }); 
}

function err_task_info(jqXHR, exception) {
    $('.task_info').append(
        "<p>Error retrieving task information for '" + application + "' application. " +
        "' Please notify the administrator, by clicking <a href=\"\">here</a>" +
        "</p>");
}

function show_task_info(data) {
    $('.task_info').append(
        "<b>Task info</b><ul>" +
        "<li>id</li><li class=\"task_id\">" +
        "<li>status</li><li class=\"task_status\">" +
	"<li>description</li><li class=\"task_description\"></li>" + 
	"<li>iosandbox</li><li class=\"task_iosandbox\"></li>" + 
	"<li>creation</li><li class=\"task_creation\"></li>" + 
	"<li>last_change</li><li class=\"task_last_change\"></li>" +
        "</ul>" +
        "<b>Output files</b>" +
        "<div class=\"task_files\">" +
        "</div>");
    if(data.tasks[0].id != null) {
	    $('.task_id').append(data.tasks[0].id);
	    $('.task_status').append(data.tasks[0].status);
	    $('.task_description').append(data.tasks[0].description);
	    $('.task_iosandbox').append(data.tasks[0].iosandbox);
	    $('.task_creation').append(data.tasks[0].creation);
	    $('.task_last_change').append(data.tasks[0].last_change);
    } else {
         $('.task_info').append(
             "<p>It seems you don't have yet a running task for '" + application +
             "' application. Please execute your task by clicking <a href=\"\">here</a>" +
             "</p>"); 
    }
}

function check_app(application) {

    $.ajax({
        type: "GET",
        url: fg_api_settings.base_url + '/' +
             fg_api_settings.version + '/applications/' +
             application,
        headers: {
            'Authorization': fg_user_info.access_token,
            //'Content-Type': 'application/json'
        },
        dataType: "json",
	crossDomain: true,
        success: function(data) {
            //alert(JSON.stringify(data));
	    if(data.id != null) {
                $('.app_info').append(
                    "<b>Application info</b><br/><ul>" +
                    "<li>id</li><li class=\"app_id\"></li>" +
                    "<li>Name</li><li class=\"app_name\"></li>" +
                    "</ul>");
                $('.app_id').append(data.id);
                $('.app_name').append(data.name);
	    } else {
	        $('.app_info').append(
	            "<p>It seems the application '" + application + "' is not registered" +
		    "in FutureGateway. " +
	            "Please notify the administrator by clicking <a href=\"\">here</a>" +
	            "");
	    }
        },
        error: function(jqXHR, exception) {
            $('app_info').append(
                "<p>Error retriving application information from FutureGateway. " +
                "Please report this, by clicking <a href=\"\">here</a>");
        }
    });
}

function check_user() {

    $.ajax({
        type: "GET", 
        url: fg_api_settings.base_url + '/' +
             fg_api_settings.version  +'/users/' +
             fg_user_info.name,
	headers: {
            'Authorization': fg_user_info.access_token,
            //'Content-Type': 'application/json'
        },
        dataType: "json",
	crossDomain: true,
        success: function(data) {
	    //alert(JSON.stringify(data));
	    if(data.id != null) {
                $('.user_info').append(
                    "<b>User info</b><br/><ul>" +
                    "<li>First name</li><li class=\"first_name\">" +
		    "<li>Last name</li><li class=\"last_name\"></li>" + 
		    "<li>Email address</li><li class=\"email\"></li>" + 
		    "<li>Created</li><li class=\"creation\"></li>" + 
		    "<li>Modified</li><li class=\"modified\"></li>" +
                    "</ul>");
	        $('.id').append(data.id);
	        $('.first_name').append(data.first_name);
	        $('.last_name').append(data.last_name);
	        $('.email').append(data.mail);
	        $('.creation').append(data.creation);
	        $('.modified').append(data.modified);
            } else {
		$('.user_info').append(
                    "<p>It seems you are not yet registered as FutureGateway user. " +
		    "Please enable your mebmership by clicking <a href=\"\">here</a> " +
		    "to subscribe");
	    }
	},
        error: function(jqXHR, exception) {
            //alert(JSON.stringify(exception));
            $('.user_info').append(
                "<p>Error retrieving rapisarda pluchino net logo " +
                "Please enable your mebmership by clicking <a href=\"\">here</a>" +
                "to subscribe");
        }
   });
}

export default function(rootElementId) {

        // Prepare page
	var html = build_page();

	// Display page
	$(`#${rootElementId}`).html(html);
}
