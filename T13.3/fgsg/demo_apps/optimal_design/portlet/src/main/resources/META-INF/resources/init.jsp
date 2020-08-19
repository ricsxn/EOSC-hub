<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %><%@
taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %><%@
taglib uri="http://liferay.com/tld/theme" prefix="liferay-theme" %><%@
taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>
<%@page import="java.io.*" %>
<%@page import="java.net.*" %>
<%@page import="java.util.Base64" %>
<%@page import="com.liferay.portal.kernel.json.*" %> 
<%@page import="it.infn.ct.FutureGatewayAPIs" %>
<liferay-theme:defineObjects />
<portlet:defineObjects />
<%

    // FG settings
    String fgUser = "futuregateway";
    String fgPassword = "";
    String fgBaseUrl = "http://fgapiserver";
    String fgAPIVer = "v1.0";
    boolean fgStatus = false;
    String errMessage = "";

    // Application settings
    String appName = "Optimal Design";
    int appId = 0;
    String appGroup = "optimal design";
    int appGroupId = 14;
    String fgsgGroup = "fgsg_user";


    // Initialize FutureGatewayAPIs object
    FutureGatewayAPIs fgAPIs =
        new FutureGatewayAPIs(fgBaseUrl, fgAPIVer, fgUser, fgPassword);

    // Check FG service
    fgStatus = fgAPIs.checkServer();

    // Retrieve user account information
    String screenName = user.getScreenName();
    String firstName = user.getFirstName();
    String lastName = user.getLastName();
    String emailAddress = user.getEmailAddress();

    // User settings
    int userId = 0;
    boolean userExists = false;
    boolean userGroup = false;
    String portletAccessToken = "";
    String delegatedAccessToken = "";
    String message = "";

    // Use FGAPIs to check user and retieve tokens
    if(fgStatus) {
        // 1st Get the portlet token
        portletAccessToken = fgAPIs.getAccessToken(fgUser, null);

        // 2nd Check if the user exists
        fgAPIs.setAuthMode(FutureGatewayAPIs.AuthModes.BASELINE_TOKEN);
        userExists = fgAPIs.userExists(screenName);
        if(!userExists) {
            // User does not exists, create it
            fgAPIs.createUser(screenName,
                              firstName,
                              lastName,
                              emailAddress,
                              "");
            // Check if the inserted user now exists
            userExists = fgAPIs.userExists(screenName);
        }

        // 3rd If the user exists take care of its group membership
        if(userExists) {
            userGroup = fgAPIs.userHasGroup(screenName, appGroup);
            if(!userGroup) {
              // Register it if not yet belonging
              String[] userGroups = { "" + appGroupId };
              fgAPIs.addUserGroups(screenName, userGroups);
              // Re-Check
              userGroup = fgAPIs.userHasGroup(screenName, appGroup);
            }
            // 4th Retrieve the delegated access token
            delegatedAccessToken = fgAPIs.getAccessToken(fgUser, screenName);
            fgAPIs.setBaselineToken(delegatedAccessToken);
        } else {
          message = "unable to create FG user";
        }
    }
    // The GUI interface has now enough information to perform next activitis
    // using the FutureGateway APIs with the delegatedAccessToken
%>

<script type="text/javascript">

//FGAPIServer status
fgstatus = "<%= fgStatus %>";

// Collect user account info into FG user info
fg_user_info = {
  name: '<%= screenName %>',
  first_name: '<%= firstName %>',
  last_name: '<%= lastName %>',
  email: '<%= emailAddress %>',
  insitute: 'unknown',
  err_message: '<%= errMessage %>',
  access_token: '<%= delegatedAccessToken %>',
  user_exists: '<%= userExists %>',
  user_group: '<%= userGroup %>',
  portlet_token: '<%= portletAccessToken %>', // To be removed!!!
  message: '<%= message %>',
};

// FG API server settings
fg_api_settings = {
  base_url: 'http://localhost/fgapiserver',
  version: 'v1.0',
  enabled: '<%= fgStatus %>',
};

// Application settigns
fg_app_settings = {
  name: '<%= appName %>',
  id: '<%= appId %>',
  group_name: '<%= appGroup %>',
  group_enabled: '<%= userGroup %>',
};
null</script>
