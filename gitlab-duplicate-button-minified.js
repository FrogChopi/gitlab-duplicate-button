// ==UserScript==
// @name         gitlab duplicate button
// @description  a simply tool to rapidly duplicate pipeline schedule
// @match        https://gitlab.com/*/pipeline_schedules*
// @match        https://*.gitlab.com/*/pipeline_schedules*
// @grant        GM_log
// @author       FrogChopi
// @version      1
// @run-at       document-end
// @downloadURL  https://github.com/FrogChopi/gitlab-duplicate-button/blob/main/gitlab-duplicate-button.js
// ==/UserScript==

!async function(){"use strict";let e=document.createElement("style");e.innerText="\n        .modal {\n            position: fixed;\n            top: 0;\n            left: 0;\n            z-index: 1050;\n            width: 100%;\n            height: 100%;\n            overflow: hidden;\n            outline: 0;\n            background-color: rgba(0, 0, 0, 0.5);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n        }\n\n        .modal-dialog {\n            position: relative;\n            width: auto;\n            margin: 0.5rem;\n            pointer-events: none;\n            max-width: 500px;\n        }\n\n        .modal-content {\n            position: relative;\n            display: flex;\n            flex-direction: column;\n            width: 100%;\n            pointer-events: auto;\n            background-color: #fff;\n            background-clip: padding-box;\n            border: 1px solid rgba(0, 0, 0, 0.2);\n            border-radius: 0.3rem;\n            outline: 0;\n        }\n\n        .modal-header {\n            display: flex;\n            align-items: flex-start;\n            justify-content: space-between;\n            padding: 1rem;\n            border-bottom: 1px solid #dee2e6;\n            border-top-left-radius: 0.3rem;\n            border-top-right-radius: 0.3rem;\n        }\n\n        .modal-title {\n            margin-bottom: 0;\n            line-height: 1.5;\n            font-size: 1.25rem;\n        }\n\n        .close {\n            float: right;\n            font-size: 1.5rem;\n            font-weight: 700;\n            line-height: 1;\n            color: #000;\n            text-shadow: 0 1px 0 #fff;\n            opacity: .5;\n            padding: 1rem;\n            margin: -1rem -1rem -1rem auto;\n            background-color: transparent;\n            border: 0;\n        }\n\n        .modal-body {\n            position: relative;\n            flex: 1 1 auto;\n            padding: 1rem;\n        }\n\n        .modal-footer {\n            display: flex;\n            flex-wrap: wrap;\n            align-items: center;\n            justify-content: flex-end;\n            padding: 0.75rem;\n            border-top: 1px solid #dee2e6;\n            border-bottom-right-radius: 0.3rem;\n            border-bottom-left-radius: 0.3rem;\n        }\n    ",document.head.appendChild(e);let n=async function(e,n,t,o,a){return new Promise(((i,l)=>{let d={method:e,headers:o,credentials:"same-origin"};a&&(d.body=JSON.stringify(a)),fetch(`https://${n}${t}`,d).then((e=>e.json())).then((e=>{i(e)})).catch((e=>l(e)))}))};var t;await(t='a[data-testid="edit-pipeline-schedule-btn"]',new Promise((e=>{const o=new MutationObserver((a=>{document.querySelector(t)&&"function"==typeof $&&(document.querySelectorAll('a[data-testid="edit-pipeline-schedule-btn"]').forEach((e=>{let t=e.href.match(/(\d+)$/)[1];var o=document.createElement("BUTTON"),a=document.createElement("IMG");o.className="btn btn-default btn-md gl-button btn-icon",a.className="gl-button-icon gl-icon s16 gl-fill-current",a.src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png",o.appendChild(a),o.id=t,o.title="Duplicate scheduled pipeline",o.ariaLabel="Duplicate scheduled pipeline",o.onclick=async()=>{let e=await n("GET",document.location.host,`/api/v4/projects/${+document.body.getAttribute("data-project-id")}/pipeline_schedules/${t}`,{"Content-Type":"application/json"},void 0),o=document.createElement("DIV");o.innerHTML=`\n                  <div class="modal" tabindex="-1" role="dialog">\n            <div class="modal-dialog" role="document">\n                <div class="modal-content">\n                <div class="modal-header">\n                    <h5 class="modal-title">Modal title</h5>\n                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                    <span aria-hidden="true">&times;</span>\n                    </button>\n                </div>\n                <div class="modal-body">\n                    <h5>New schedule name</h5>\n                    <div class="input-group mb-3">\n                        <div class="input-group-prepend">\n                            <span class="input-group-text" id="basic-addon1">@</span>\n                        </div>\n                        <input type="text" class="form-control" placeholder="New schedule name" aria-label="New schedule name" value="${e.description}" aria-describedby="basic-addon1">\n                    </div>\n                    <h6>Are you sure you want to duplicate this scheduled pipeline?</h6>\n                </div>\n                <div class="modal-footer">\n                    <button type="button" aria-label="Duplicate" class="btn btn-primary">Duplicate scheduled pipeline</button>\n                    <button type="button" aria-label="Cancel" class="btn btn-secondary" data-dismiss="modal">Cancel</button>\n                </div>\n                </div>\n            </div>\n            </div>\n            `,o.querySelector('button[aria-label="Close"]').onclick=()=>o.remove(),o.querySelector('button[aria-label="Cancel"]').onclick=()=>o.remove(),o.querySelector('button[aria-label="Duplicate"]').onclick=async()=>{if(o.querySelector('input[aria-label="New schedule name"]').value==e.description)alert("The new schedule name can't be the same !");else{let t={description:o.querySelector('input[aria-label="New schedule name"]').value,ref:e.ref,cron:e.cron,cron_timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,active:!1,variables:e.variables},a=(await n("POST",document.location.host,`/api/v4/projects/${document.body.getAttribute("data-project-id")}/pipeline_schedules`,{"Content-Type":"application/json","X-CSRF-Token":document.querySelector('meta[name="csrf-token"]').content},t)).id;for(let t=0;t<e.variables.length;t++)n("POST",document.location.host,`/api/v4/projects/${document.body.getAttribute("data-project-id")}/pipeline_schedules/${a}/variables`,{"Content-Type":"application/json","X-CSRF-Token":document.querySelector('meta[name="csrf-token"]').content},e.variables[t]);window.location.replace(`${window.location.origin}${window.location.pathname}/${a}/edit?id=${a}`)}},document.body.appendChild(o)},e.parentNode.insertBefore(o,e.parentNode.lastChild)})),e(document.querySelector(t)),o.disconnect())}));o.observe(document.body,{childList:!0,subtree:!0})})))}();