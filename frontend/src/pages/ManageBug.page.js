////////////////// Import dependencies //////////////////
import React, { useState, useEffect } from 'react';
import { IoIosAdd } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

import LargeDataRow from '../components/shared/LargeDataRow.component';
import UpdateCard from '../components/bug/UpdateCard.component';
import Loader from '../components/shared/Loader.component';
import NavBar from '../components/shared/NavBar.component';
import AddUpdateBox from '../components/updates/AddUpdateBox.component';

import Colors from "../utils/Colors.utils";
import AddPeriod from '../utils/AddPeriod.utils';
import { showErrorAlert, showInstructionAlert } from "../utils/Alerts.utils";
////////////////////////////////////////////////////////

////////////////// Component //////////////////
export default function ManageBugPage() {
    const location = useLocation();
    const bug = location.state.data;
    const datetime = new Date(bug.datetime);

    const updates = useSelector(state => state.update.updates);
    const hasFetchedBulk = useSelector(state => state.update.hasFetchedBulk);
    const hasDeletedUpdate = useSelector(state => state.update.hasDeleted);
    const hasUpdated = useSelector(state => state.bug.hasUpdated);
    const hasDeletedBug = useSelector(state => state.bug.hasDeleted);

    const [ title, setTitle ] = useState(bug.title);
    const [ detailedDescription, setDetailedDescription ] = useState(bug.detailedDescription);
    const [ solution, setSolution ] = useState(bug.solution ? bug.solution : "");
    const [ loading, setLoading ] = useState(true);
    const [ addUpdateBoxOpened, setAddUpdateBoxOpened ] = useState(false);
    const [ fixLocation, setFixLocation ] = useState("");
    const [ fixDetails, setFixDetails ] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/");
        } else {
            dispatch({
                type: "update/fetch_bulk",
                payload: bug.id
            });
        }
    }, []);

    useEffect(() => {
        if (hasDeletedUpdate === 1) {
            dispatch({
                type: "update/reset_delete"
            });
            dispatch({
                type: "update/fetch_bulk",
                payload: bug.id
            });
        } else if (hasDeletedUpdate === 0) {
            dispatch({
                type: "update/reset_delete"
            });
            showErrorAlert("Failed to delete update.");
        }
    }, [hasDeletedUpdate]);

    useEffect(() => {
        if (hasFetchedBulk === 1) {
            setLoading(false);
            dispatch({
                type: "update/reset_fetch_bulk"
            });
        } else if (hasFetchedBulk === 0) {
            setLoading(false);
            dispatch({
                type: "update/reset_fetch_bulk"
            });
            showErrorAlert("Failed to fetch updates for bug.");
        }
    }, [hasFetchedBulk]);

    useEffect(() => {
        if (hasUpdated === 1) {
            dispatch({
                type: "bug/reset_update"
            });
            navigate("/home");
        } else if (hasUpdated === 0) {
            dispatch({
                type: "bug/reset_update"
            });
            showErrorAlert("Failed to update bug.");
        }
    }, [hasUpdated]);

    useEffect(() => {
        if (hasDeletedBug === 1) {
            dispatch({
                type: "bug/reset_delete"
            });
            navigate("/home");
        } else if (hasDeletedBug === 0) {
            dispatch({
                type: "bug/reset_delete"
            });
            showErrorAlert("Failed to delete bug.");
        }
    }, [hasDeletedBug]);

    function navAction() {
        dispatch({
          type: "project/logout"
        });
        navigate("/");
    }

    function updateBug() {
        if (title.length >= 5 && detailedDescription.length >= 5) {
            if (solution.length > 1) {
                dispatch({
                    type: "bug/update",
                    payload: {
                        id: bug.id,
                        title: AddPeriod(title),
                        detailedDescription: AddPeriod(detailedDescription),
                        solution: AddPeriod(solution)
                    }
                });
            } else {
                dispatch({
                    type: "bug/update",
                    payload: {
                        id: bug.id,
                        title: AddPeriod(title),
                        detailedDescription: AddPeriod(detailedDescription),
                        solution: undefined
                    }
                });
            }
        } else {
            showInstructionAlert("Inputs are too short.");
        }
    }

    function deleteBug() {
        const confirmed = window.confirm(
          "Are you sure you want to delete this bug?"
        );
        if (confirmed) {
          dispatch({
            type: "bug/delete",
            payload: bug.id
          });
        }
    }

    function navToHome() {
        navigate("/home");
    }

    function openAddUpdateBox() {
        setAddUpdateBoxOpened(true);
    }

    return (
        <div style={styles.root}>
            <NavBar
                actionText="Log out"
                action={navAction}
            />
            <div style={styles.main}>
                <div style={styles.innerMain}>
                    <p style={styles.id}>Bug: #{bug.id}</p>
                    <LargeDataRow 
                        prompt="Status"
                        data={bug.fixed ? "Fixed" : "Unfixed"}
                    />
                    <LargeDataRow 
                        prompt="Created on"
                        data={`${datetime.getDate()}/${datetime.getMonth() + 1}/${datetime.getFullYear()}`}
                    />
                    <p style={styles.prompt}>Title:</p>
                    <input 
                        type="text"
                        style={styles.singleLineInputField}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={23}
                    />
                    <p style={styles.prompt}>Detailed description:</p>
                    <textarea
                        value={detailedDescription}
                        onChange={(e) => setDetailedDescription(e.target.value)}
                        rows={3}
                        style={styles.multilineInputField}
                    />
                    <div style={styles.divider} />
                    <div style={styles.updateTopBar}>
                        <div style={styles.updateLeftTopBar}>
                            <p style={styles.prompt}>Updates:</p>
                        </div>
                        <div style={styles.updateRightTopBar}>
                            {
                                !addUpdateBoxOpened ?
                                    <IoIosAdd onClick={openAddUpdateBox} style={styles.addUpdateIcon}/>
                                : null
                            }
                        </div>
                    </div>
                    {
                        addUpdateBoxOpened ?
                            <AddUpdateBox 
                                bugId={bug.id}
                                setAddUpdateBoxOpened={setAddUpdateBoxOpened}
                                fixLocation={fixLocation}
                                setFixLocation={setFixLocation}
                                fixDetails={fixDetails}
                                setFixDetails={setFixDetails}
                            />
                        : null
                    }
                    {
                        loading ?
                            <Loader loading={loading}/>
                        :
                            updates.map((update) => {
                                return (
                                    <UpdateCard 
                                        key={update.id} 
                                        update={update}
                                    />
                                )
                            })
                    }
                    <div style={styles.divider} />
                    <p style={styles.prompt}>Solution:</p>
                    <textarea
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        rows={3}
                        style={styles.multilineInputField}
                    />
                    <div style={styles.buttonsFrame}>
                        <button onClick={updateBug} style={styles.updateButton}>Update bug</button>
                        <button onClick={deleteBug} style={styles.deleteButton}>Delete bug</button>
                        <button onClick={navToHome} style={styles.cancelButton}>Cancel</button>
                    </div>
                </div>
            </div>    
        </div>
    )
}
/////////////////////////////////////////////

////////////////// Styles //////////////////
const styles = {
    root: {
        width: "100%",
        display: "flex",
        flexDirection: "column"
    },

    main: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: "50px"
    },

    innerMain: {
        width: "40%",
        display: "flex",
        flexDirection: "column"
    },

    id: {
        fontSize: "1.8rem",
        fontFamily: "Arial",
        color: Colors.four,
        fontWeight: "bold",
        marginLeft: "10px"
    },

    prompt: {
        fontSize: "1.167rem",
        fontFamily: "Arial",
        color: Colors.four,
        marginTop: "10px",
        marginBottom: "0px",
        marginLeft: "0px",
        marginLeft: "10px"
    },

    singleLineInputField: {
        width: "100%",
        height: '30px',
        backgroundColor: Colors.seven,
        borderWidth: '0',
        fontSize: '1.055rem',
        fontFamily: "Arial",
        padding: '12px',
        borderRadius: "5px",
        marginTop: "15px"
    },

    multilineInputField: {
        width: "100%",
        borderWidth: '0',
        backgroundColor: Colors.seven,
        fontSize: '1.055rem',
        fontFamily: "Arial",
        padding: "12px",
        borderRadius: "5px",
        marginTop: "20px"
    },

    divider: {
        width: "98%",
        height: "1px",
        backgroundColor: Colors.eight,
        marginTop: "30px",
        marginBottom: "10px"
    },

    updateTopBar: {
        width: "100%",
        display: "flex",
        alignItems: "center"
    },

    updateLeftTopBar: {
        width: "80%"
    },

    updateRightTopBar: {
        width: "20%",
        display: "flex",
        justifyContent: "flex-end"
    },

    addUpdateIcon: {
        fontSize: "2rem",
        color: Colors.two,
        cursor: "pointer"
    },

    buttonsFrame: {
        width: "80%",
        display: "flex",
        alignItems: "center",
        marginTop: "45px",
        marginBottom: "100px"
    },

    updateButton: {
        width: "7.5rem",
        height: "2.5rem",
        marginRight: "20px",
        marginLeft: "10px",
        backgroundColor: Colors.two,
        borderWidth: "0",
        borderRadius: '5px',
        color: Colors.five,
        fontFamily: "Arial",
        cursor: 'pointer',
        fontSize: '1rem'
    },

    deleteButton: {
        width: "7.5rem",
        height: "2.5rem",
        marginRight: "20px",
        backgroundColor: Colors.nine,
        borderWidth: "0",
        borderRadius: '5px',
        color: Colors.five,
        fontFamily: "Arial",
        cursor: 'pointer',
        fontSize: '1rem'
    },
    
    cancelButton: {
        width: "7.5rem",
        height: "2.5rem",
        marginRight: "20px",
        backgroundColor: Colors.five,
        border: `2px solid ${Colors.four}`,
        borderRadius: '5px',
        color: Colors.six,
        fontFamily: "Arial",
        cursor: 'pointer',
        fontSize: '1rem'
    }
};
///////////////////////////////////////////