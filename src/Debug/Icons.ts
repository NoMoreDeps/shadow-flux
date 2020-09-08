export const IconResize = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
<g><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"><path d="M7337.8,4974c-69-71-72.9-151.5-9.6-226.3l46-53.7l962.7-9.6l962.7-9.6L7878.6,3242.2C6518.9,1872.9,6457.5,1807.7,6457.5,1742.5c0-97.8,69-164.9,166.8-164.9c71,0,111.2,38.4,1492.1,1419.2C8897,3777.3,9541.4,4415.9,9549,4415.9c9.6,0,15.3-431.5,15.3-957v-957l61.4-51.8c49.9-42.2,74.8-49.9,128.5-40.3c36.4,5.8,84.4,28.8,105.5,49.9c40.3,38.4,40.3,53.7,40.3,1258.1v1219.7l-53.7,46l-53.7,46H8594H7393.4L7337.8,4974z"/><path d="M1883.6-2756.7C1103-3537.3,458.6-4175.9,451-4175.9c-9.6,0-15.3,431.5-15.3,957v957l-61.4,51.8c-49.9,42.2-74.8,49.9-128.5,40.3c-36.4-5.8-84.4-28.8-105.5-49.9c-40.3-38.4-40.3-53.7-40.3-1258.1v-1219.7l53.7-46l53.7-46H1406h1200.5l55.6,55.6c38.4,38.4,55.6,74.8,55.6,117s-17.3,78.6-55.6,117l-55.6,55.6h-951.2c-523.6,0-951.2,5.8-951.2,13.4c0,9.6,638.6,654,1421.1,1436.4c1392.3,1392.3,1421.1,1423,1421.1,1495.9c0,95.9-71,161.1-172.6,161.1C3304.7-1337.5,3251-1389.3,1883.6-2756.7z"/></g></g>
</svg>`;

export const IconMaximize = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
<g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)"><path d="M918.6,3326v-842H509.3H100V-732v-3216h4221.7h4221.7l4.7,776.5l7,778.8l673.6,7l671.3,4.7V893.5V4168H5409.3H918.6V3326z M9638,888.8l-7-3000.8h-537.9h-537.9l-7,2296.8l-4.7,2299.1l-3667.4,4.7l-3665.1,7l-7,697l-4.7,694.7H5421h4221.7L9638,888.8z M8262.8-732v-2958.7L4317-3686L369-3679l-7,2923.6c-2.3,1609.2,0,2937.7,7,2954c7,21.1,821,28.1,3952.7,28.1h3941.1V-732z"/></g></g>
</svg>`;

export const createIcon = (icon: string, style ?: Partial<CSSStyleDeclaration>) => {
  const span = document.createElement("span");
  span.innerHTML = icon;
  span.children[0].setAttribute("fill", "white")

  if (style) {
    for(let itm in style) {
      (span.children[0]as HTMLElement).style[itm] = style[itm]!;
    }
  }

  return span;
}