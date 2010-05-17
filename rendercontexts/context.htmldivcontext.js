/**
 * The Render Engine
 * DocumentContext
 *
 * @fileoverview A render context which wraps the DOM document node.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 779 $
 *
 * Copyright (c) 2008 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

// Includes
Engine.include("/rendercontexts/context.htmlelement.js");

Engine.initObject("HTMLDivContext", "HTMLElementContext", function() {

/**
 * @class A simple extension of the {@link HTMLElementContext} which uses a DIV
 * element to represent the context.  This is just a convenience method.
 * <p/>
 * As of the 1.3 beta version, further development on HTMLDivContext is
 * hereby ceased.  No further development will occur to support HTML elements
 * as viable targetable contexts.  Due to the nature of updating an HTML
 * context, the decision has been made to drop support for it.
 *
 * @extends HTMLElementContext
 * @deprecated
 */
var HTMLDivContext = HTMLElementContext.extend(/** @scope HTMLDivContext.prototype */{

   /**
    * Create an instance of a document rendering context.  This context
    * represents the HTML document body.  Theoretically, only one of these
    * contexts should ever be created.
    * @constructor
    */
   constructor: function(name, contextWidth, contextHeight) {
      var ctx = $("<div>").css({
         width: contextWidth,
         height: contextHeight,
         position: "absolute",
			overflow: "hidden"
      });
      this.base(name || "HTMLDivContext", ctx);
		this.setViewport(Rectangle2D.create(0, 0, contextWidth, contextHeight));
   }
   
}, /** @scope HTMLDivContext.prototype */{

   /**
    * Get the class name of this object
    *
    * @return {String} The string "HTMLDivContext"
    */
   getClassName: function() {
      return "HTMLDivContext";
   }
});

return HTMLDivContext;

});
