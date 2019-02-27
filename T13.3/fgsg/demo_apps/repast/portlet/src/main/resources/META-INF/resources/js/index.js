import $ from 'jquery';

var application_name = 'repast';
var application_id = 6;
var ftp_host = '<ftp_host>';
var ftp_path = '<ftp_path>';
var default_model_url = 'http://' + ftp_host + '/' + ftp_path + '/model.tar';
var default_parameters_url = 'http://' + ftp_host + '/' + ftp_path + '/input/batch_params.xml_0';
var welcomeText = "The <a href=\"https://repast.github.io\">" + application_name + "</a> application, is a free and open source agent-based modeling toolkit that offers users a rich variety of features. In this area it is possible to execute a given model with a given set of parameters, for the (PALMS) experiment.";

function build_page() {
  // Below the structure of the page containing elemennts:
  //   * User info
  //   * Application info
  //   * Task info ans its output
  var html = "<div class=\"" + application_name + "\">" +
             "  <p>" + welcomeText + "</p>" +
             "  <div class=\"error\"></div>" +
             "  <div class=\"user_info\"></div>" +
             "  <div class=\"app_info\"></div>" +
             "  <div class=\"submission_form\"></div>" +
             "  <div class=\"task_info\"></div>" +
             "</div>";
  if(themeDisplay.isSignedIn()) {
      // init call may report errors to be notified
      if(fg_user_info.err_message.length>0) {
          message = "Unable to retrieve information for user: '" +
                    fg_user_info.name + "'; error: '" +
                    fg_user_info.err_message;
          report_error(message, user_support);
      } else {
          // Performs a cascading check on user, app and task
          // adding dynamically elements into the web pages
          // accordingly to the FG API calls performed
          check_user_app_tasks();
      }
  } else {
    mail_subject = "User support for application: " + application_name;
    mail_body = "I would like to be contacted in order to get access or " +
                "receive more information about the application: '" + application_name +
                "'.\nMany thanks,\nRegards\n" + "<your name>";
    // Notify that this service is available only for logged users
    html = "<div class=\"alert alert-danger\" role=\"alert\">" +
           "  <button type=\"button\"" +
           "          class=\"close\"" +
           "          data-dismiss=\"alert\">&times;</button>" +
           "  <strong>Warning!</strong> " + 
           "You have to sign-in to access this service." +
           "</div>" +
           "<div class=\"disclaimer\">" + 
           "<p>Please contact the <a href=\"" + user_support +
           "?subject=" + mail_subject + "&body=" + mail_body + 
           "\">user support</a> to get information and instructions " +
           "about the access to this application." +
           "</p></div>";
  }
  return html;
}

// Do a cascading cleanup action on top of div contents
// This does not affect div data content
function reset_areas(area) {
    $("." + area).empty();
}

// Report an error message to the interface
function report_error(message, support_url) {
  mail_subject = "User support for application: " + application_name;
  mail_body = "Reported error: '" + message + "'";
  $('.error').append(
    "<div class=\"alert alert-danger\" role=\"alert\">" +
    "<p>" + message + "</br>" +
    "You can notify this problem, by clicking <a href=\"" +
    support_url + "?subject=" + mail_subject + "&body=" + mail_body +
    "\">here</a>." + 
    "</p></div>"
  );
}

// Reset submission form
function reset_form() {
    $("#model").val(default_model_url);
    $("#parameters").val(default_parameters_url);
}

// Success case for do_task 
var do_task_done = function(data) {
    // Notify success action
    alert("New " + application_name + " task has been successfully created");
    // Rebuild task table after successful submission
    check_tasks(application_name);
}

// Error case for do_task 
var do_task_error = function(jqXHR, exception) {
    alert("Error creating new task");
}

// Generic task submission call DELETE/SUBMIT
function do_task(model, parameters) {
    // Execute Submit POST command
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/tasks';
    taskData = {
        "application": application_id,
        "description": application_name + " fgsg",
        "arguments": [model, parameters ],
        //"output_files": [{"name": "repast.json"}],
        "output_files": [],
    };
    doPost(url, taskData, do_task_done, do_task_error);
}

// Perform application submission
function do_submit() {
    $("#submit_button").prop('disabled','true');
    model = $("#model").val()
    parameters = $("#parameters").val()
    do_task(model, parameters);
    $("#submit_button").removeAttr("disabled");
}
 
// Confirm submission action
function confirm_dialog(message, action) {
    if(confirm(message)) {
        action();
    } else {
        console.log("Execution cancelled");
    }
}

function exec_application() {
   confirm_dialog("Are you sure to submit " + application_name + "?", do_submit); 
}

// Create the application submission form
function build_submission_form() {
    reset_areas("submission_form");
    $(".submission_form").append(
      "<div><table>" +
      "<tr><td><label for=\"model\">Model:</label></td><td></td>" +
      "<td><input id=\"model\" type=\"text\" id=\"model\" name=\"model\" size=\"100%\"></td><td></td></tr>" +
      "<tr><td><label for=\"parameters\">Parameters:</label></td><td></td>" +
      "<td><input id=\"parameters\" type=\"text\" id=\"parameters\" name=\"parameters\" size=\"100%\"></td><td></td></tr>" +
      "<tr><td><button type=\"submit\" " +
      "        class=\"btn btn-success\" " +
      "        id=\"submit_button\" " +
      ">Execute</button></td><td></td>" +
      "<td><button class=\"btn btn-danger\" " +
      "        id=\"reset_button\" " +
      ">Reset</button></td><td></td></tr>" +
      "</table>" +
      "</div>"
    );
    reset_form();
    $("#submit_button").on("click",exec_application);
    $("#reset_button").on("click",reset_form);
}

// Extract value from runtime-data vector 
function get_runtime_value(runtime_data, data_field) {
    var runtime_value = "<unknown>";
    for(var i=0; i<runtime_data.length; i++) {
        if(runtime_data[i].name == data_field) {
            runtime_value = runtime_data[i].value;
	    break;
	}
    }
    return runtime_value;
}

// Success trash_task
var trash_task_done = function() {
    alert("Task successfully removed");
    check_tasks(application_name);
}

// Error trash_task
var trash_task_error = function() {
    alert("Sorry, unable to delete task");
}

// Trash the selected task
var trash_task = function() {
    task_id = this.trash_task_id;
    table_row = this.trash_task_row;
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/tasks/' + task_id;
    doDelete(url, trash_task_done, trash_task_error);
}

// Task record action
var do_action_button = function() {
    //alert("ID: '" + this.id + "' Action: '" + this.name + "'");
    trash_table_row = this.id.split('_')[1]; // i-th element of task table
    trash_task_id = this.id.split('_')[2]; // FG task_id
    if(this.name == 'trash') {
      confirm_dialog("Are you sure to remove the task?", trash_task);
    } else if(this.name == 'refresh') {
      check_tasks(application_name);
    } else {
      alert("Unhespected task action: '" + this.name + "'");
    }
}

// Refresh whole task list
var refresh_tasks = function() {
    check_tasks(application_name);
}

// Build the tasks table from passed task_info values
function build_tasks_table(task_data) {
    var table_rows="";
    for(var i=0; i<task_data.length; i++) {
        var status = task_data[i].status;
	var task_id = task_data[i].id;
        var creation = task_data[i].creation;
        var model = task_data[i].arguments[0];
        var parameters = task_data[i].arguments[1];
	var action_button = "";
	if(status == "DONE") {
            status = "<span class=\"badge badge-pill badge-success\">DONE</span>";
            action_button =
                "<button name=\"trash\" id=\"task_" + i + "_" + task_id + "\">" +
                "<span class=\"glyphicon glyphicon glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>" +
                "</button>";
	} else if(status == "ABORTED") {
            status = "<span class=\"badge badge-pill badge-danger\">ABORT</span>";
             action_button =
                "<button name=\"trash\" id=\"task_" + i + "_" + task_id + "\">" +
                "<span class=\"glyphicon glyphicon glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>" +
                "</button>";
	} else if(status == "RUNNING") {
            status = "<span class=\"badge badge-pill badge-primary\">RUNNING</span>";
            action_button = 
                "<button name=\"refresh\" id=\"task_" + i + "_" + task_id + "\">" +
		"<span class=\"glyphicon glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>" +
		"</button>";
	} else {
            status = "<span class=\"badge badge-pill badge-warning\">" + status  + "</span>";
            action_button = 
                "<button name=\"refresh\" id=\"task_" + i + "_" + task_id + "\">" +
		"<span class=\"glyphicon glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>" +
		"</button>";
	}
        table_rows += 
            "<tr>" +
            "<td>" + action_button + "</td>" +
            "<td>" + creation + "</td>" + 
            "<td>" + status + "</td>" +
            "<td>" + model + "</td>" +
            "<td>" + parameters + "</td>" +
            "</tr>";
    }
    // Fill table if task records exist
    if(table_rows.length > 0) {
      $(".task_info").append(
        "    <table id=\"task_table_title\">" +
        "    <tr><td>" +
        "        <button id=\"refresh_tasks\">" +
	"        <span class=\"glyphicon glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>" +
	"        </button></td>" +
	"        <td><h4>Executions</h4></td></tr>" +
        "    </table>" +
        "    <table id=\"task_table\" class=\"table\"></table>");
      $("#refresh_tasks").on("click",refresh_tasks);
      $('#task_table').append(
        "<tr>" + 
	"<th>Action</th>" + 
	"<th>Date</th>" +
	"<th>Status</th>" +
	"<th>Model</th>" +
	"<th>Parameters</th>" +
	"</tr>");
      $('#task_table').append(table_rows);
      // Assign right function call to generated refresh buttons
      for(var i=0; i<task_data.length; i++) {
          var task_id = task_data[i].id;
          $("#task_" + i + "_" + task_id).on("click",do_action_button);
      }
    } else {
      // Report no records are available yet
      $('.task_info').append(
          "<div class=\"alert alert-info\" role=\"alert\">No tasks avaiable yet for this application</div>"
      );
    }
}

// Success case for check task 
var proc_check_tasks = function(data) {
    reset_areas("task_info");
    // Process and create the task list	
    task_info = data['tasks'];
    $('.task_info').data('task_info',data['tasks']);
    // Now build tasks table
    build_tasks_table(task_info);
}

// Error case for check task
var proc_check_tasks_error = function(jqXHR, exception) {
    reset_areas("task_info");
    report_error("Error retrieving task information for '" +
                 application_name + "' application. ",
                 user_support);
}

// Check task
function check_tasks(application) {
   url = fg_api_settings.base_url + '/' +
         fg_api_settings.version  + '/users/' +
         fg_user_info.name + '/tasks?application=' +
         application;
    doGet(url, proc_check_tasks, proc_check_tasks_error);
}

// Success case for check_app
var proc_check_app_tasks = function(data) {
    if(data.id != null) {
        // Application hidden data
        app_info = {
            'id': data.id,
            'name': data.name,
        };
        $('.app_info').data('app_info',app_info)
        // Now it is possible to build the submission form
        build_submission_form();
        // Now check the application tasks
        check_tasks(application_name);
    } else {
        reset_areas("app_info");
        report_error("It seems the application '" + application_name +
                     "' is not registered in FutureGateway. ",
                      user_support);
    }
}

//Error case for check_app
var proc_check_app_tasks_error = function(jqXHR, exception) {
    reset_areas("app_info");
    report_error("Error retriving '" + application_name + "' application " +
                 "information from FutureGateway. Please ensure your " +
                 "membership has the necessary rights to access '" +
                 application_name + "' application.",
                 user_support);
}

// Check application
function check_app_tasks(application) { 
   url = fg_api_settings.base_url + '/' +
         fg_api_settings.version + '/applications/' +
         application;
    doGet(url, proc_check_app_tasks, proc_check_app_tasks_error);
}

// Success case for check_user_app_tasks
var proc_user_app_tasks = function(data) {
    if(data.id != null &&
       data.mail != 'default@liferay.com') {
        // User hidden data
        user_info = {
            'id': data.id,
            'first_name': data.first_name,
            'last_name': data.last_name,
            'email': data.mail,
            'creation': data.creation,
            'modified': data.modified,
        };
        $('.user_info').data('user_info',user_info);
        // User information recovered, it is possible to check the app.
        check_app_tasks(application_name);
    } else {
        reset_areas("user_info");
        report_error("It seems you are not yet registered as " +
                     "FutureGateway user.",
                     user_support);
    }
}

// Error case for check_user_app_task
var proc_user_app_tasks_error = function(jqXHR, exception) {
    reset_areas("user_info");
    report_error("Error retrieving portal user information.",
                 user_support);
}

// Check user application and task
function check_user_app_tasks() {
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/users/' +
          fg_user_info.name;
    doGet(url, proc_user_app_tasks, proc_user_app_tasks_error);
}

//
// FutureGateway helper functions
//


function doGet(url, successFunction, failureFunction) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

function doPost(url, reqData, successFunction, failureFunction) {
    $.ajax({
        type: "POST",
        url: url,
        dataType: "json",
        data: JSON.stringify(reqData),
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

function doDelete(url, successFunction, failureFunction) {
    $.ajax({
        type: "DELETE",
        url: url,
        dataType: "json",
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}


export default function(rootElementId) {
	$(`#${rootElementId}`).html(build_page());
}
