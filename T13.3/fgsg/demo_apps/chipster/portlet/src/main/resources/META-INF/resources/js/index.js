/**************************************************************************
 * Copyright (c) 2019:
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

var application_name = 'chipster';
var welcomeText = 
  "<img src=\"/egissod/documents/51171/0/chipster_image.png/e3a12473-63f8-656d-8ec4-cfa9404d5207?t=1556113400645\"" +
  "     width=\"100%\"/>" +
  "<p>This page allows members of the Applications on Demand Infrastructure " +
  "to create a temporary user accounts to a Chipster data analysis server, " +
  "running in the EGI Federated Cloud.</p>";
  "<p>In case you do not have yet the necessary " +
  "credentials to access Chipster application, a web form will " +
  "prompt you to setup your own username and password pair. "
  "The username will be the same of the portal user account " +
  "and once the credentials will be correcty generated, " +
  "it will be possible to access the Chipster application. " +
  "It will be also possible to reset credentials anytime or " +
	          "because they got expired.</p>";
var launch_chipster = 
	"<table id=\"launch_chipster\"" +
        "       name=\"launch_chipster\"" +
	"       bgcolor=\"#E8EDF1\"" +
	"       border=\"0\"" +
	"       cellpadding=\"1\"" +
	"       cellspacing=\"1\"" +
	"       style=\"width: 400px;\">" +
	"<tbody>" +
	"<tr><td rowspan=\"3\">" +
	"    <img alt=\"\"" +
	"         src=\"/egissod/documents/51171/0/launch_button-3.png/ea9ab2a0-c5a1-c9cd-930b-085209bfd816?t=1555687623683\"" +
	"         style=\"font-size: 14px; line-height: 19px; width: 46px; height: 50px;\">" +
	"    </td>" +
	"    <td><a href=\"http://193.144.35.160:8081/chipster.jnlp\"" +
	"        style=\"color: rgb(79, 133, 195); font-size: 14px; line-height: 19px;\">" +
	"        Launch Chipster</a>" +
	"    </td>" +
	"</tr>" +
	"<tr><td>" +
	"    <font face=\"sans-serif\">" +
	"    <span style=\"font-size: 11px; line-height: 19px;\">or launch with more memory: <a" +
	"    href=\"http://193.144.35.151:8081/servlet.jnlp?memory=3072\">3GB</a> or <a" +
	"    href=\"http://193.144.35.151:8081/servlet.jnlp?memory=6144\">6GB</a>" +
	"    </span></font>" +
	"    </td>" +
	"</tr>" +
	"<tr><td><span style=\"font-size:11px;\">" +
	"    <em>If you have trouble launching Chipster with Mac, read&nbsp;<a" +
	"    href=\"http://chipster.csc.fi/manual/launchChipsterWithMac.html\">this</a>" +
	"    </em></span>" +
	"    </td>" +
	"</tr>" +
	"</tbody>" +
	"</table>";

var exe_notes =
       "<h3>Note</h3>" +
       "<p>Please note that the Chipster server of the Application on Demand " +
       "Infrastructure has only a limited capacity. Due to that, we hope " +
       "that the users of this Chipster server will not have more than one " +
       "job running at a time. If you need more resources, please consider " +
       "setting up your own <a " +
       "href=\"https://github.com/chipster/chipster/wiki/FedCloudChipster\">" +
       "Chipster server</a>.</p>" +
       "<h4>What is Chipster?</h4>" +
       "<p>Chipster is a user-friendly analysis software for high-throughtput " +
       "data. It contains over 300 analysis tools for next generation sequencing " +
       "(NGS), microarray, proteomics and sequence data. Users can save and share " +
       "automatic analysis workflows, and visualize data interactively using a " +
       "built-in genome browser and many other visualizations.</p>"
       "<p>Chipster's client software uses Java Web Start to install itself " +
       "automatically, and it connects to computing servers for the actual analysis.</p>" +
       "<p>Please see the Chipster <a href=\"https://chipster.csc.fi\">main site</a> " +
       "for courses, updates and other information.";



// Chipster username and passowrd
// Active password stores the last available password used to access Chipster
var default_username = fg_user_info.name;
var default_password = gen_passwd();
var active_password = "";
var active_form = false;

function gen_passwd() {
  // Generate a short but strong random password
  return Math.random().toString(36).slice(-8);
}

function generic_error(message) {
  mail_subject = "User support for application: " + application_name;
  mail_body = "I would like to be contacted in order to get access or " +
              "receive more information about the application: '" + application_name +
              "'.\nMany thanks,\nRegards\n" + "<your name>";
  html = "<div class=\"alert alert-danger\" role=\"alert\">" +
         "  <button type=\"button\"" +
         "          class=\"close\"" +
         "          data-dismiss=\"alert\">&times;</button>" +
         "  <strong>Warning!</strong> " + 
         "  <p>" + message + "</p>" +
	 "</div>" +
         "<div class=\"disclaimer\">" + 
         "<p>Please contact the <a href=\"" + user_support +
         "?subject=" + mail_subject + "&body=" + mail_body + 
         "\">user support</a> to get information and instructions " +
         "about the access to this application." +
         "</p></div>";
  return html;
}

function build_page() {
  // Below the structure of the page containing elemennts:
  //   * User info
  //   * Application info
  //   * Task info and its output
  var html = "<div style=\"background-color:white; " +
             "             padding-top: 10px; padding-right: 10px; " +
             "             padding-bottom: 10px; padding-left: 10px\"" +
	     "     class=\"" + application_name + "\">" +
             "  <p>" + welcomeText + "</p>" +
             "  <div class=\"error\"></div>" +
             "  <div class=\"user_info\"></div>" +
             "  <div class=\"app_info\"></div>" +
             "  <div class=\"submission_form\"></div>" +
             "  <div class=\"chipster_info\"></div>" +
             "  <div class=\"task_info\"></div>" +
             "</div>";
  if(themeDisplay.isSignedIn()) {
    if(fg_user_info.err_message.length > 0) {
      // Backend error reporting
      html = generic_error("Backend error reporting: '" + fg_user_info.err_message + "'.");
    } else {
      // Cascading call sequence building querying FG and 
      // building the web page acconrdingly
      check_user_app_tasks();
    }
  } else {
    // Notify that this service is available only for logged users
    html = generic_error("You have to sign-in to access this service.");
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
function reset_form(username, password) {
    $("#username").val(username);
    $("#password").val(password);
}

// Reset form to default username and password
var reset_default = function() {
    reset_form(default_username, default_password);
}

// Success case for do_task 
var do_task_done = function(data) {
    // Notify success action
    alert("New " + application_name + " task has been successfully created");
    // Case of existing task starts from here
    reset_default();
    // Update task_info view
    check_tasks(application_name);
}

// Refresh task view
var refresh_tasks = function(data) {
    check_tasks(application_name);
}

// Error case for do_task 
var do_task_error = function(jqXHR, exception) {
    alert("Error creating new task");
}

// Generic task submission call SUBMIT
function do_task(username, password) {
    // Execute Submit POST command
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/tasks';
    taskData = {
        "application": app_info['id'],
        "description": application_name + " fgsg",
        "arguments": [username, password ],
        "output_files": [{"name": "user.json"}],
    };
    doPost(url, taskData, do_task_done, do_task_error);
}

// Perform application submission
function do_submit() {
    $("#submit_button").prop('disabled','true');
    username = $('#username').val(); 
    password = $("#password").val();
    do_task(username, password);
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

// Build the tasks table from passed task_info values
function build_tasks_table(task_data) {
    var table_rows="";
    var done_entry = false;
    for(var i=0; i<task_data.length; i++) {
        var status = task_data[i].status;
        var task_id = task_data[i].id;
        var creation = task_data[i].creation;
        var user = task_data[i].arguments[0];
        var password = "<input id=\"password_" + task_id + "\"" +
                       "       type=\"text\"" +
                       "       name=\"password_" + task_id + "\"" +
                       "       value=\"" + task_data[i].arguments[1] + "\">";
        var action_button = "";
        if(status == "DONE") {
            status = "<span class=\"badge badge-pill badge-success\">DONE</span>";
            action_button =
                "<button name=\"trash\" id=\"task_" + i + "_" + task_id + "\">" +
                "<span class=\"glyphicon glyphicon glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>" +
                "</button>";
	   if(i == 0) {
             done_entry = true;
             active_password = task_data[i].arguments[1];
	   }
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
            "<td>" + password + "</td>" +
            "</tr>";
    }
    // Fill table if task records exist
    if(table_rows.length > 0) {
      $(".task_info").append(
	"    <p>Please press the button below to show past executions.</p>" +
	"    <button name=\"view_hide_creds\"" +
        "            id=\"view_hide_creds\"" +
        "            data-toggle=\"collapse\"" +
        "            data-target=\"#exe_list\">Show</button>" +
        "    <div id=\"exe_list\" class=\"collapse\">" +
        "    <table id=\"task_table_title\">" +
        "    <tr><td>" +
        "        <button id=\"refresh_tasks\">" +
        "        <span class=\"glyphicon glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>" +
        "        </button></td>" +
        "        <td><h4>Executions</h4></td></tr>" +
        "    </table>" +
        "    <table id=\"task_table\" class=\"table\"></table>");
      $('#view_hide_creds').on("click",function() {
          if($('#view_hide_creds').html() == "Hide") {
            $('#view_hide_creds').html("Show");
          } else {
            $('#view_hide_creds').html("Hide");
          }
      });
      $("#refresh_tasks").on("click",refresh_tasks);
      $('#task_table').append(
        "<tr>" + 
        "<th>Action</th>" + 
        "<th>Date</th>" +
        "<th>Status</th>" +
        "<th>Password</th>" +
        "</tr>");
      $('#task_table').append(table_rows);
      // Assign right function call to generated refresh buttons
      for(var i=0; i<task_data.length; i++) {
          var task_id = task_data[i].id;
          $("#task_" + i + "_" + task_id).on("click",do_action_button);
      }
      $(".task_info").append("</div>");
      // In case at least a task is in DONE status, inform the user to switch
      // in chipster access mode
      if(done_entry) {
          $('.task_info').append(
            "<p>Your last active task is in  done status, you can now hide account form, pressing the button " +
            "below.</p>" +
            "<button name=\"hide_form\" id=\"hide_form\" class=\"btn btn-warning\">Hide form</button>"
          );
          $("#hide_form").on("click", hide_form); 
      }
    } else {
      // Report no records are available yet
      $('.task_info').append(
          "<div class=\"alert alert-info\" role=\"alert\">No tasks avaiable yet for this application</div>"
      );
    }
}

// Called by the 'ACCESS' button when at lease a DONE task exist
var hide_form = function() {
  active_form = false;
  reset_areas("submission_form");
  check_user_app_tasks();
}

// Renew credentials
function renew_passwd() {
  reset_form(default_username, gen_passwd());
}

// Create the application submission form
function build_submission_form() {
    reset_areas("submission_form");
    $(".submission_form").append(
      "<div><h3>Specify user account data</h3><br/>" +
      "<table>" +
      "<tr><td><label for=\"username\">User name:</label></td>" +
      "    <td></td>" +
      "    <td><input id=\"username\"" +
      "               type=\"text\"" +
      "               id=\"username\"" +
      "               name=\"username\"" +
      "               readonly>" +
      "    </td>" +
      "    <td></td></tr>" +
      "<tr><td><label for=\"password\">Password:</label></td>" +
      "    <td></td>" +
      "    <td><input id=\"password\"" +
      "               name=\"password\"" +
      "               type=\"text\"" +
      "               readonly></td>" +
      "    <td><button name=\"renew_pwd\"" +
      "                id=\"renew_pwd\">" +
      "                <span class=\"glyphicon glyphicon-repeat\">" +
      "                </span></button></td></tr>" +
      "<tr><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td><button type=\"submit\" " +
      "                class=\"btn btn-success\" " +
      "                id=\"submit_button\">Execute</button></td>" +
      "    <td></td>" +
      "    <td><button class=\"btn btn-danger\" " +
      "                id=\"reset_button\">Reset</button></td>" +
      "    <td></td></tr>" +
      "</table>" +
      "</div>");
    reset_form(default_username, default_password);
    $("#submit_button").on("click",exec_application);
    $("#reset_button").on("click",renew_passwd);
    $("#renew_pwd").on("click",renew_passwd);
}

function build_access_pane() {
  reset_areas("chipster_info");
  $(".chipster_info").append(
    "<p>Your Chipster access credentials:</p>" +
    "<table>" +
    "<tr><td>Username: </td><td><b>" + default_username + "</b></td></tr>" +
    "<tr><td>Password: </td><td><b>" + active_password + "</b></td></tr>" +
    "</table>" +
    launch_chipster +
    "<p>If you would like to reset your current chipster credentials, please press the button "+
    "below, to show the submission form.</p>" +
    "<button id=\"reset_creds\" class=\"btn btn-danger\">Show form</button>" +
    exe_notes
  );
  $('#launch_chipster').css('background-color', '#E8EDF1');
  $("#reset_creds").on("click", show_form);
}    

// Goes to the credentials submission form
var show_form = function() {
  active_form = true;
  reset_areas("chipster_info");
  check_user_app_tasks();
}

// Success case for check task 
var proc_check_tasks = function(data) {
    reset_areas("task_info");
    // Process and create the task list
    credentials_task = -1;
    task_info = data['tasks'];
    $('.task_info').data('task_info',task_info);
    if(task_info.length > 0) {
      // At least a task exists, locate the last one in DONE status
      for(i=0; i<task_info.length; i++) {
        if(task_info[i].status == "DONE") {
	  credentials_task = i;
          active_password = task_info[i].arguments[1];
          break;
        }
      }
      console.log("active form: " + active_form + " cred_tasks " + credentials_task);
      console.log("active pass: " + active_password);
      // If no credential tasks have been found, show the credentials
      // submission form
      if(credentials_task < 0 || active_form == true) {
        build_submission_form();
	build_tasks_table(task_info);
      } else {
	// Credentials are available, proovide Chipster access
        build_access_pane();
      }
    }
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
    reset_areas("app_info");
    if(data.id != null) {
        // Application hidden data
        app_info = {
            'id': data.id,
            'name': data.name,
        };
        $('.app_info').data('app_info',app_info);
        // Now check the application tasks
        check_tasks(application_name);
    } else {
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
    reset_areas("user_info");
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
        report_error("It seems you are not yet registered as " +
                     "FutureGateway user.",
                     user_support);
    }
}

// Error case for check_user_app_task
var proc_user_app_tasks_error = function(jqXHR, exception) {
    reset_areas("user_info");
    report_error("Error retrieving portal user information. " +
	         "URL: '" + url + "'",
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
        cache: false,
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
        cache: false,
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
        cache: false,
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
