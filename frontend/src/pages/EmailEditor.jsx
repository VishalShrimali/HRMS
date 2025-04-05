import React, { useRef, useState, useEffect } from "react";
import EmailEditor from "react-email-editor";
import { Container, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const CustomEmailEditor = () => {
    const emailEditorRef = useRef(null);
    const location = useLocation();
    const [templateData, setTemplateData] = useState(null);
    const [title, setTitle] = useState("");

    // ✅ Default template
    const defaultTemplate = {
        counters: { u_row: 3, u_column: 3, u_content_text: 3, u_content_image: 1, u_content_button: 1 },
        body: {
            rows: [
                {
                    cells: [1],
                    columns: [
                        {
                            contents: [
                                {
                                    type: "image",
                                    values: {
                                        src: { url: "https://cdn.zybrzeus.com/sameer/20/10/zybrzeus_logo-01-UGzrV09S.png" },
                                        alt: "Company Logo",
                                        width: "250px",
                                        maxWidth: "250px",
                                        alignment: "center",
                                    }
                                }
                            ]
                        }
                    ],
                    values: { backgroundColor: "#E6F0FF", padding: "20px" }
                },
                {
                    cells: [1],
                    columns: [
                        {
                            contents: [
                                {
                                    type: "text",
                                    values: {
                                        text: "<h3 style='color:#0056b3;'>THANKS FOR SIGNING UP!</h3><h1>Zybrzeus Email Designer</h1>",
                                        textAlign: "center"
                                    }
                                },
                                {
                                    type: "text",
                                    values: { text: "<p>Hi,<br>You're almost ready to get started...</p>", textAlign: "center" }
                                },
                                {
                                    type: "button",
                                    values: {
                                        text: "Call to Action",
                                        href: "#",
                                        color: "#ffffff",
                                        backgroundColor: "#FF8C00",
                                        borderRadius: "6px",
                                        alignment: "center",
                                        padding: "10px 20px"
                                    }
                                }
                            ]
                        }
                    ],
                    values: { backgroundColor: "#ffffff", padding: "30px" }
                },
                {
                    cells: [1],
                    columns: [
                        {
                            contents: [
                                {
                                    type: "text",
                                    values: {
                                        text: "<h3>Get in touch</h3><p>+11 333 4444</p><p>Info@YourCompany.com</p>",
                                        textAlign: "center",
                                        color: "#0056b3"
                                    }
                                }
                            ]
                        }
                    ],
                    values: { backgroundColor: "#E6E6E6", padding: "20px" }
                }
            ]
        }
    };

    // ✅ Fetch template by title from backend
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailTitle = queryParams.get("title");
        if (!emailTitle) return;

        setTitle(emailTitle); // Set title for saving

        const fetchTemplateByTitle = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/v1/templates/title/${encodeURIComponent(emailTitle)}`);
                if (!response.ok) throw new Error("Failed to fetch template");
                const data = await response.json();

                if (data && data.design) {
                    setTemplateData(data.design); // ✅ Load saved template
                } else {
                    setTemplateData(defaultTemplate); // ❌ No saved template? Use default
                }
            } catch (error) {
                console.error("❌ Error fetching template:", error);
                setTemplateData(defaultTemplate); // Load default if error
            }
        };

        fetchTemplateByTitle();
    }, [location.search]);

    // ✅ Load template into the editor
    const onEditorReady = () => {
        if (!emailEditorRef.current || !emailEditorRef.current.editor) {
            console.error("Editor instance not available.");
            return;
        }

        console.log("✅ Editor is fully ready!");
        if (templateData) {
            emailEditorRef.current.editor.loadDesign(templateData); // ✅ Load correct template
        }
    };

    // ✅ Export email design
    const exportDesign = () => {
        if (emailEditorRef.current) {
            emailEditorRef.current.editor.exportHtml((data) => {
                console.log("Exported HTML:", data.html);
                console.log("Exported JSON:", data.design);
                alert("✅ Email template exported! Check console.");
            });
        }
    };
    
    // ✅ Save template to server
    const saveTemplate = async () => {
        if (!title) {
            alert("❌ No title found for the template.");
            return;
        }

        if (emailEditorRef.current) {
            emailEditorRef.current.editor.saveDesign(async (design) => {
                emailEditorRef.current.editor.exportHtml(async (data) => {
                    const templateData = {
                        title: title,
                        html: data.html,
                        design: design
                    };

                    try {
                        const response = await fetch("http://localhost:8000/api/v1/emails/templates", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(templateData),
                        });

                        const result = await response.json();
                        if (response.ok) {
                            alert("✅ Template saved successfully!");
                        } else {
                            alert(`❌ Failed to save template: ${result.message}`);
                        }
                    } catch (error) {
                        console.error("❌ Error saving template:", error);
                        alert("❌ Error saving template. Check console.");
                    }
                });
            });
        }
    };

    return (
        <Container className="mt-4 ">
            <h2>Email Template Builder</h2>
            <p><strong>Editing Template:</strong> {title || "Untitled"}</p>
            <EmailEditor ref={emailEditorRef} onLoad={onEditorReady}  style={{ height: "85vh", width: "30vw"}} />
            <div className="mt-3 ">
                <Button variant="primary" onClick={exportDesign} className="me-2">
                    Export Template
                </Button>
                <Button variant="success" onClick={saveTemplate}>
                    Save Template
                </Button>
            </div>
        </Container>
    );
};

export default CustomEmailEditor;
