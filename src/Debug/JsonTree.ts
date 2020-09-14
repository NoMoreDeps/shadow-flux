//Ported from Max Leiter : https://github.com/MaxLeiter/jsonTree/blob/master/src/jsonTree.js

export class jsonTree {
	/**
	* json: URL for json file or a JSON object
	* selector: the elements selector to apply the tree to
	* depth: bool to add a "depth-#" class, can increase loading times
	**/
	constructor(selector: string | HTMLElement, json: any,  depth: number) {
		this.generateTree(selector, json);
		this.classify(selector, depth);
	}

	/** Generate the DOM elements for the tree**/
	generateTree(selector: string | HTMLElement, json: any) {
    const element: HTMLElement = typeof selector === "string" ? document.querySelector<HTMLElement>(selector)! : selector;
    
		element.classList.add("jsonTree");
    element.innerHTML = this.json2html(json);
    
		const top = element.querySelector<HTMLElement>("[data-id=\"top\"]")!;
		top.addEventListener("click", (e) => {
      const target = e.target! as HTMLElement;
			e.preventDefault();
			if (target?.nodeName?.toUpperCase?.() === "LI") {
				if (Array.from(target.childNodes).length > 1) {
					this.toggleClass(target, "selected");
				}
			}
		});
	}

	classify(selector: string | HTMLElement, depth: number) {
		this.applyClasses(selector, "li", "ul", depth);
		this.applyClasses(selector, "ul", "li", depth);
	}

	/** Applies classes to the element, including "parent" and "depth-#" **/
	applyClasses(selector: string | HTMLElement, parent: string, child: string, _depth: number) {
    const $this = this;
    const parents = typeof selector === "string" ?  Array.from(document.querySelectorAll(`${selector} ${parent}`)) : Array.from(selector.querySelectorAll(`${parent}`)) 
    
		parents.forEach(function(element){
			const filter = Array.from(element.children).filter((el) => el.tagName.toLowerCase() === child.toLowerCase().toString())
			if (filter.length > 0) { // It's a parent!
				element.classList.add("parent");
				(element as HTMLElement).style.cursor = "pointer";
			} else {
				(element as HTMLElement).style.cursor = "auto";
			}

			// The amount of parents, "#top" is assigned by json2html
			if (_depth) {
				const count = $this.depth(element as HTMLElement);
				element.classList.add("depth-" + count);
			}
		});
	}

	/** Returns the amount of parents of an element **/
	depth(ele: HTMLElement): number {
		if (ele?.parentElement?.getAttribute("data-id") === "top") {
			return ele == null ? 0 : 1 + this.depth(ele.parentElement);
		} else {
			return 0;
		}
	}

  getJsonTypeIcon(value: any) {
    switch (typeof value) {
      case "object" : 
				if (Array.isArray(value)) return `[${value.length}]`;
				if (value === null) return "null";
        return `{${Object.keys(value).length}}`
    }

    return "";
  }

  getColorType(value: any) {
    switch(typeof value) {
      case "string": return "strColor";
      case "boolean": return "boolColor";
      default: return "otherColor";
    }
  }

	/** Returns a JSON file in HTML tokens **/
	json2html(json: any) {
		let i, html = "";
		json = this.htmlEscape(JSON.stringify(json));
		json = JSON.parse(json);
		html += "<ul data-id=\"top\">";
		for (i in json) {
			html += "<li>"+ i +": " + this.getJsonTypeIcon(json[i]);
			if (typeof json[i] === "object") {
				html += this.json2html(json[i]);
			}
			else html += `<span class="${this.getColorType(json[i])}">${JSON.stringify(json[i])}</span>`;
			html += "</li>";
		}
		html += "</ul>";
		return html;
	}

	/** To stop XSS attacks by using JSON with HTML nodes **/
	htmlEscape(str: string) {
		const tagsToReplace = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;"
		} as {[key: string]: string};
		return str.replace(/[&<>]/g, function(tag) {
			return tagsToReplace[tag] || tag;
		});
	}

	/** Toggles an elements class **/
	toggleClass(el: HTMLElement, className: string) {
		if (el) {
			el.classList.toggle(className);
		}
	}
}