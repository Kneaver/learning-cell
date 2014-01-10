var fs = require('fs')
  , sys = require('util')
  , path = require('path')
  ;
  
function stlpages( app, options)
{
    var g_options = options || {};
    // dirname is the abs path to directory of storyline files
    g_options.dirname = g_options.dirname || path.join( path.dirname(__dirname), "storyline");

    var stories = {};
    var files = {};
    var scripts = {};
    
    return function ( req, response, next) 
    {
        if ( req.path == "/")
            page = "/index";
        else
            page = req.path;
          
        // this could be optimized with some cache like below
        if ( files.hasOwnProperty( page))
            response.sendfile( files[ page]);
        if ( scripts.hasOwnProperty( page))
        {
            response.setHeader('Content-Type', 'text/javascript');
            response.send( scripts[ page]);
        }
        
        // goal of this middleware is to make it easy to add stories in a web site, safe and have pretty URI 
        // using all power of web in triggers and use transitions to pages
        toppath = "";
        leafpath = "";
        path1 = page;
        while ( path1.length)
        {
            elem = path.basename( path1);
            path1 = path.dirname( path1);
            if ( path1 === '/')
            {
                toppath = path.join( path1, elem);
                path1 = "";
            }
            else
                leafpath = path.join( elem, leafpath);
        }
        console.log( "stlpages tries " + page);
        // used for debug console.log( req);
        // page (uri) will be the directory of the story
        if ( stories.hasOwnProperty( toppath))
            fullpath = stories[ toppath];
        else
        {
            var infile = path.join( g_options.dirname, toppath);
            if ( !fs.existsSync( infile))
              return next();
            files = fs.readdirSync( infile);
            fullname = "";
            priority = 0;
            while ( (fullname == "") && ( priority < 5))
            {
                for (i = 0; (fullname == "") && (i < files.length); i++)
                {
                    file = files[ i];
                    stats = fs.statSync( path.join( infile, file));
                   
                    if ( stats.isFile())
                    {
                        if ( fullname == "")
                        if ( ( priority > 0) || ( new RegExp( ".*" + toppath, "gi").test( file) ))
                        if ( path.extname( file) === '.story')
                            fullname = path.basename( file, path.extname( file));
                    }
                }
            }
            // Not found
            if ( fullname == "")
                return next();
            console.log( "found fullname=" + fullname);
            dirwithtail = "";
            priority = 0;
            while ( (dirwithtail == "") && ( priority < 5))
            {
                for (i = 0; (dirwithtail == "") && (i < files.length); i++)
                {
                    file = files[ i];
                    stats = fs.statSync( path.join( infile, file));
                    if ( stats.isDirectory())
                    {
                        if ( fullname != "")
                        if ( ( priority == 0) || ( new RegExp( fullname + ".*" + "output", "gi").test( file) ))
                            dirwithtail = file;

                        if ( fullname != "")
                        if ( ( priority == 2) || ( new RegExp( fullname + ".*" + "web", "gi").test( file) ))
                            dirwithtail = file;

                        if ( ( priority == 3) || ( new RegExp( ".*" + toppath + ".*" + "output", "gi").test( file) ))
                            dirwithtail = file;

                        if ( ( priority == 4) || ( new RegExp( ".*" + toppath + ".*" + "web", "gi").test( file) ))
                            dirwithtail = file;
                        // xx-cd would not use html5 or mobile
                    }
                }
            }
            // Not found
            if ( dirwithtail == "")
                return next();
            console.log( "found dirwithtail=" + dirwithtail);
            fullpath = path.join( infile, dirwithtail);
        }
        if ( leafpath == "")
        {
            file = path.join( fullpath, "story_html5.html");
            if ( !fs.existsSync( file))
              return next();
            response.sendfile( file);
            stories[ toppath] = fullpath;
            files[ page] = file;    
        }
        else
        {
            console.log( "leafpath=" + leafpath);
            var infile = path.join( path.join( fullpath, leafpath));
            if ( path.basename( leafpath) == "user.js")
            {
                // this is where we trick by adding extra calls
                var text1 = "";
                if ( fs.existsSync( infile))
                    text1 += fs.readFileSync( infile);
                var infile = path.join( path.join( fullpath, leafpath.replace( ".js", "_ext.js")));
                if ( fs.existsSync( infile))
                    text1 += fs.readFileSync( infile);
                var infile = __filename.replace( ".js", "-lib.js");
                console.log( "lib=" + infile);
                if ( fs.existsSync( infile))
                    text1 += fs.readFileSync( infile);
                response.setHeader('Content-Type', 'text/javascript');
                response.send( text1);
                scripts[ page] = text1;
            }
            else
            {
                if ( fs.existsSync( infile))
                {
                    response.sendfile( infile);
                    files[ page] = infile;
                }
            }
        }
    }

    // useful for debug when using forms and arguments to URI
    // console.log( req.query);
    // console.log( req.body);
}

exports.stlpages = stlpages;
