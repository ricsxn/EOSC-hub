package r.studio.portlet;

import r.studio.constants.RStudioPortletKeys;

//import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCPortlet;

//import java.io.IOException;
import javax.portlet.Portlet;
//import javax.portlet.PortletException;
//import javax.portlet.RenderRequest;
//import javax.portlet.RenderResponse;

import org.osgi.service.component.annotations.Component;

/**
 * @author root
 */
@Component(
	immediate = true,
	property = {
		"com.liferay.portlet.display-category=category.sample",
		"com.liferay.portlet.instanceable=true",
		"javax.portlet.display-name=R Studio",
		"javax.portlet.init-param.template-path=/",
		"javax.portlet.init-param.view-template=/view.jsp",
		"javax.portlet.name=" + RStudioPortletKeys.RStudio,
		"javax.portlet.resource-bundle=content.Language",
		"javax.portlet.security-role-ref=power-user,user"
	},
	service = Portlet.class
)

public class RStudioPortlet extends MVCPortlet {

//    public void render(RenderRequest renderRequest, RenderResponse renderResponse) throws PortletException, IOException
//    {
//        User currentUser = PortalUtil.getUser(renderRequest);
//
//        super.render(renderRequest, renderResponse);
//    }
}
