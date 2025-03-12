// ==UserScript==
// @name         gitlab duplicate button
// @description  a simply tool to rapidly duplicate pipeline schedule
// @match        https://gitlab.com/*/pipeline_schedules*
// @match        https://*.gitlab.com/*/pipeline_schedules*
// @grant        GM_log
// @run-at       document-end
// @author       FrogChopi
// @version      1
// @run-at       document-idle
// @downloadURL  https://github.com/FrogChopi/gitlab-duplicate-button/blob/main/gitlab-duplicate-button.js
// ==/UserScript==

(async function() {
    'use strict';

     function waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
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

    document.querySelectorAll('a[data-testid="edit-pipeline-schedule-btn"]').forEach( el => {
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
                  <div id="delete-pipeline-schedule-modal___BV_modal_outer_" style="position: absolute; z-index: 1040;">
                        <div id="delete-pipeline-schedule-modal" role="dialog" aria-label="Delete scheduled pipeline" aria-describedby="delete-pipeline-schedule-modal___BV_modal_body_" class="modal fade show gl-block gl-modal" aria-modal="true" style="">
                              <div class="modal-dialog modal-sm">
                                    <span tabindex="0"></span>
                                    <div id="delete-pipeline-schedule-modal___BV_modal_content_" tabindex="-1" class="modal-content">
                                          <header id="delete-pipeline-schedule-modal___BV_modal_header_" class="modal-header">
                                                <h2 class="modal-title">Delete scheduled pipeline</h2>
                                                <button aria-label="Close" type="button" class="btn btn-default btn-sm gl-button btn-default-tertiary btn-icon">
                                                      <!---->
                                                      <svg data-testid="close-icon" role="img" aria-hidden="true" class="gl-button-icon gl-icon s16 gl-fill-current">
                                                            <use href="/assets/icons-8791a66659d025e0a4c801978c79a1fbd82db1d27d85f044a35728ea7cf0ae80.svg#close"></use>
                                                      </svg>
                                                      <!---->
                                                </button>
                                          </header>
                                          <div id="delete-pipeline-schedule-modal___BV_modal_body_" class="modal-body">
                                                <!---->
                                                <h5>New schedule name</h5>
                                                <div class="input-group mb-3">
                                                      <div class="input-group-prepend">
                                                            <span class="input-group-text" id="basic-addon1">@</span>
                                                      </div>
                                                      <input type="text" class="form-control" placeholder="New schedule name" aria-label="New schedule name" aria-describedby="basic-addon1" value="${ data.description }">
                                                </div>
                                                <!---->
                                                <h6>Are you sure you want to duplicate this scheduled pipeline?</h6>
                                                <!---->
                                          </div>
                                          <footer id="delete-pipeline-schedule-modal___BV_modal_footer_" class="modal-footer">
                                                <button aria-label="Cancel" type="button" class="btn js-modal-action-cancel btn-default btn-md gl-button">
                                                      <!---->
                                                      <!---->
                                                      <span class="gl-button-text">
                                                      Cancel
                                                      </span>
                                                </button>
                                                <!---->
                                                <button aria-label="Duplicate" type="button" class="btn js-modal-action-primary btn-warning btn-md gl-button">
                                                      <!---->
                                                      <!---->
                                                      <span class="gl-button-text">
                                                            Duplicate scheduled pipeline
                                                      </span>
                                                </button>
                                          </footer>
                                    </div>
                                    <span tabindex="0"></span>
                              </div>
                        </div>
                        <div id="delete-pipeline-schedule-modal___BV_modal_backdrop_" class="modal-backdrop"></div>
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
})()
