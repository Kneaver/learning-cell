// this file for javascript to be server side included in user.js

function CreateXmlHttp()
{
	var xmlHttp = null;
	var arrCtrlName = new Array("MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp");
	var nIndex = 0;
	
	if (window.XMLHttpRequest) 
	{
		try
		{
			xmlHttp = new XMLHttpRequest();
		}
		catch (e)
		{
			xmlHttp = null;
		}
	}
	
	if (xmlHttp == null && window.ActiveXObject)
	{
		// Use the ActiveX Control
		while (xmlHttp == null && nIndex < arrCtrlName.length)
		{
			try
			{
				xmlHttp = new ActiveXObject(arrCtrlName[nIndex]);
			}
			catch (e)
			{
				xmlHttp = null;
			}
			
			nIndex++;
		}

	}

	return xmlHttp;
}
