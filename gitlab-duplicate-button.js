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

(async function() {
    'use strict';

    let style = document.createElement("style")
    style.innerText = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1050;
            width: 100%;
            height: 100%;
            overflow: hidden;
            outline: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-dialog {
            position: relative;
            width: auto;
            margin: 0.5rem;
            pointer-events: none;
            max-width: 500px;
        }

        .modal-content {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            pointer-events: auto;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 0.3rem;
            outline: 0;
        }

        .modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            border-top-left-radius: 0.3rem;
            border-top-right-radius: 0.3rem;
        }

        .modal-title {
            margin-bottom: 0;
            line-height: 1.5;
            font-size: 1.25rem;
        }

        .close {
            float: right;
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1;
            color: #000;
            text-shadow: 0 1px 0 #fff;
            opacity: .5;
            padding: 1rem;
            margin: -1rem -1rem -1rem auto;
            background-color: transparent;
            border: 0;
        }

        .modal-body {
            position: relative;
            flex: 1 1 auto;
            padding: 1rem;
        }

        .modal-footer {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            padding: 0.75rem;
            border-top: 1px solid #dee2e6;
            border-bottom-right-radius: 0.3rem;
            border-bottom-left-radius: 0.3rem;
        }
    `
    document.head.appendChild(style)

    let auth_req = async function ( method, host, path, headers, payload ) { return new Promise ( ( resolve, reject ) => {    
        let options = {
            method: method,
            headers: headers,
            credentials: 'same-origin'
        }

        if ( payload )
            options.body = JSON.stringify(payload)

        // console.log(`https://${host}${path}`)
        // console.log(options);

        fetch(`https://${host}${path}`, options)
            .then(response => response.json() )
            .then(data => { resolve(data) })
            .catch(error => reject(error));
    }); }
   

    let load = () => document.querySelectorAll('a[data-testid="edit-pipeline-schedule-btn"]').forEach( el => {

        let id = el.href.match(/(\d+)$/)[1]

        var btn = document.createElement('BUTTON')
        var icn = document.createElement("IMG")

        btn.className = "btn btn-default btn-md gl-button btn-icon"
        icn.className = "gl-button-icon gl-icon s16 gl-fill-current"
        icn.src = "https://cdn-icons-png.flaticon.com/512/1621/1621635.png"

        btn.appendChild(icn)

        btn.id = id
        btn.title = "Duplicate scheduled pipeline"
        btn.ariaLabel = "Duplicate scheduled pipeline"

        btn.onclick = async () => {
            let data = await auth_req(
                "GET",
                document.location.host,
                `/api/v4/projects/${+document.body.getAttribute("data-project-id")}/pipeline_schedules/${id}`,
                { 'Content-Type': 'application/json' },
                undefined
            )

            let modal = document.createElement('DIV')
            modal.innerHTML = `
                  <div class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Modal title</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h5>New schedule name</h5>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">@</span>
                        </div>
                        <input type="text" class="form-control" placeholder="New schedule name" aria-label="New schedule name" value="${ data.description }" aria-describedby="basic-addon1">
                    </div>
                    <h6>Are you sure you want to duplicate this scheduled pipeline?</h6>
                </div>
                <div class="modal-footer">
                    <button type="button" aria-label="Duplicate" class="btn btn-primary">Duplicate scheduled pipeline</button>
                    <button type="button" aria-label="Cancel" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                </div>
                </div>
            </div>
            </div>
            `

            modal.querySelector('button[aria-label="Close"]').onclick = () => modal.remove()
            modal.querySelector('button[aria-label="Cancel"]').onclick = () => modal.remove()

            modal.querySelector('button[aria-label="Duplicate"]').onclick = async () => {
                if ( modal.querySelector('input[aria-label="New schedule name"]').value == data.description ) {
                    alert("The new schedule name can't be the same !")
                } else {
                    // console.log(data);
                   
                    let payload = {
                        description: modal.querySelector('input[aria-label="New schedule name"]').value,
                        ref: data.ref,
                        cron: data.cron,
                        cron_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        active: false,
                        variables: data.variables
                    }

                    let new_id = (
                     await auth_req(
                        "POST",
                        document.location.host,
                        `/api/v4/projects/${ document.body.getAttribute("data-project-id") }/pipeline_schedules`,
                        {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                        },
                        payload
                    ) ).id

                    for ( let i = 0 ; i < data.variables.length ; i++ ) {
                        auth_req(
                            "POST",
                            document.location.host,
                            `/api/v4/projects/${ document.body.getAttribute("data-project-id") }/pipeline_schedules/${ new_id }/variables`,
                            {
                                'Content-Type': 'application/json',
                                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                            },
                            data.variables[i]
                        )
                    }

                    window.location.replace(`${ window.location.origin }${ window.location.pathname }/${ new_id }/edit?id=${ new_id }`)
                }
            }

            document.body.appendChild(modal)
            //console.log(modal);

        }

        el.parentNode.insertBefore(btn, el.parentNode.lastChild)
    })

    function waitForElement(selector) {
        return new Promise(resolve => {
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector) && typeof $ == 'function') {
                        load();
                        resolve(document.querySelector(selector))
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    await waitForElement('a[data-testid="edit-pipeline-schedule-btn"]')
})()
