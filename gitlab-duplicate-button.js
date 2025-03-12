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

    let load = () => document.querySelectorAll('a[data-testid="edit-pipeline-schedule-btn"]').forEach( el => {
        let req = async function ( payload ) { return new Promise ( ( resolve, reject ) => {
            let host = document.location.host
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload), // Convertit l'objet JavaScript en chaîne JSON
                credentials: 'include'
            };

            fetch(`https://${host}/api/v4/projects/${+document.body.getAttribute("data-project-id")}/pipeline_schedules/${id}`, {
                method: 'GET',
                credentials: 'include', // Inclut les cookies pour l'authentification
                headers: {
                    'Accept': 'application/json',
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // Parse la réponse JSON
            })
                .then(data => {
                console.log('Succès:', data);
                resolve(data)
            })
                .catch(error => {
                console.error('Erreur:', error);
                reject(error)
            });
        });
                                             }

        let createPipelineSchedule = async function (description, ref, cron, variables) { return new Promise ( ( resolve, reject ) => {
            const projectId = document.body.getAttribute("data-project-id");
            const url = `/api/v4/projects/${ projectId }/pipeline_schedules`;

            const data = {
                description: description,
                ref: ref,
                cron: cron,
                cron_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                active: false,
                variables: variables
            };

            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                },
                credentials: 'same-origin',
                body: JSON.stringify(data)
            })
                .then(response => {
                //console.log(response);
                resolve(response);
            })
                .catch(e => {
                //console.log(e);
                reject(e)
            });
        })};

        let id = el.href.match(/(\d+)$/)[1]
        //console.log(id)

        let payload = {
            "operationName":"getPipelineSchedulesQuery",
            "variables": {
                "ids": [ id ],
                "prevPageCursor":"",
                "nextPageCursor":"",
                "projectPath": window.location.pathname.match(/^(.+)\/-\/pipeline_schedules/)[1]
            },
            "query":"query getPipelineSchedulesQuery($projectPath: ID!, $status: PipelineScheduleStatus, $ids: [ID!] = null, $sortValue: PipelineScheduleSort, $first: Int, $last: Int, $prevPageCursor: String = \"\", $nextPageCursor: String = \"\") {\n  currentUser {\n    id\n    username\n    __typename\n  }\n  project(fullPath: $projectPath) {\n    id\n    projectPlanLimits {\n      ciPipelineSchedules\n      __typename\n    }\n    pipelineSchedules(\n      status: $status\n      ids: $ids\n      sort: $sortValue\n      first: $first\n      last: $last\n      after: $nextPageCursor\n      before: $prevPageCursor\n    ) {\n      count\n      nodes {\n        id\n        description\n        cron\n        cronTimezone\n        ref\n        forTag\n        editPath\n        refPath\n        refForDisplay\n        lastPipeline {\n          id\n          detailedStatus {\n            id\n            group\n            icon\n            label\n            text\n            detailsPath\n            __typename\n          }\n          __typename\n        }\n        active\n        nextRunAt\n        realNextRun\n        owner {\n          id\n          username\n          avatarUrl\n          name\n          webPath\n          __typename\n        }\n        variables {\n          nodes {\n            id\n            variableType\n            key\n            value\n            __typename\n          }\n          __typename\n        }\n        userPermissions {\n          playPipelineSchedule\n          updatePipelineSchedule\n          adminPipelineSchedule\n          __typename\n        }\n        __typename\n      }\n      pageInfo {\n        ...PageInfo\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment PageInfo on PageInfo {\n  hasNextPage\n  hasPreviousPage\n  startCursor\n  endCursor\n  __typename\n}\n"
        }

        //console.log(payload);

        var btn = document.createElement('BUTTON')
        var icn = document.createElement("IMG")

        btn.className = "btn btn-default btn-md gl-button btn-icon"
        icn.className = "gl-button-icon gl-icon s16 gl-fill-current"
        icn.src = "https://cdn-icons-png.flaticon.com/512/1621/1621635.png"

        btn.appendChild(icn)

        btn.id = id
        btn.title = "Duplicate scheduled pipeline"
        btn.ariaLabel = "Duplicate scheduled pipeline"

        //console.log(el.parentNode.childNodes);


        btn.onclick = async () => {
            let data = await req(payload);

            //console.log(data)

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
                    await createPipelineSchedule (
                        modal.querySelector('input[aria-label="New schedule name"]').value,
                        data.ref,
                        data.cron,
                        data.variables
                    )

                    window.location.reload()
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