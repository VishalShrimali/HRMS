import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import EmailEditor from "react-email-editor";
import { Container, Button, Form } from "react-bootstrap";

const CustomEmailEditor = () => {
    const emailEditorRef = useRef(null);
    const [searchParams] = useSearchParams();
    const [emailId, setEmailId] = useState("");
    const [title, setTitle] = useState("");
    const [templateData, setTemplateData] = useState(null);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [isEditorReady, setIsEditorReady] = useState(false);

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

    useEffect(() => {
        const emailIdFromURL = searchParams.get("emailId");

        if (emailIdFromURL) {
            setEmailId(emailIdFromURL);

            const fetchEmailTitle = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/v1/emails/${emailIdFromURL}`);
                    if (!response.ok) throw new Error("Email not found");
                    const emailData = await response.json();
                    setTitle(emailData.title || "Untitled");
                } catch (error) {
                    console.error("❌ Error fetching email:", error);
                    setTitle("Untitled");
                }
            };

            const fetchTemplate = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/v1/templates/email/${emailIdFromURL}`);
                    if (!response.ok) throw new Error("Template not found");
                    const templateData2 = await response.json();
                    console.log("✅ Fetched Template Design:", templateData2.design);
                    setTemplateData(templateData2.design || defaultTemplate);
                } catch (error) {
                    console.error("❌ Error fetching template:", error);
                    setTemplateData(defaultTemplate);
                }
            };

            fetchEmailTitle();
            fetchTemplate();
        } else {
            setTitle("Untitled");
            setTemplateData(defaultTemplate);
        }
    }, [searchParams]);

    // ✅ Load template into editor when both editor and template are ready
    useEffect(() => {
        if (isEditorReady && templateData && emailEditorRef.current?.editor) {
            console.log("🚀 Loading template into editor...");
            emailEditorRef.current.editor.loadDesign(templateData);
        }
    }, [isEditorReady, templateData]);

    // ✅ Set editor ready flag when editor is fully loaded
    const onEditorReady = () => {
        console.log("✅ Editor is fully ready!");
        setIsEditorReady(true);
    };

    const exportDesign = () => {
        if (emailEditorRef.current) {
            emailEditorRef.current.editor.exportHtml((data) => {
                console.log("Exported HTML:", data.html);
                console.log("Exported JSON:", data.design);
                alert("✅ Email template exported! Check console.");
            });
        }
    };

    const saveTemplate = async () => {
        if (!emailId) return alert("❌ No emailId found.");
        if (!title) return alert("❌ Please enter a title for the template.");

        emailEditorRef.current.editor.saveDesign(async (design) => {
            emailEditorRef.current.editor.exportHtml(async (data) => {
                const payload = {
                    emailId,
                    title,
                    html: data.html,
                    design
                };

                    try {
                        const response = await fetch(`http://localhost:8000/api/v1/templates/email/${emailId}`, 
                            {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        });

                    const result = await response.json();
                    if (response.ok) {
                        alert("✅ Template saved successfully!");
                    } else {
                        alert(`❌ Failed to save: ${result.message}`);
                    }
                } catch (err) {
                    console.error("❌ Error saving template:", err);
                    alert("❌ Error occurred.");
                }
            });
        });
    };

    const sendEmail = async () => {
        if (!emailId || !recipientEmail) {
            return alert("❌ Email ID or recipient missing");
        }

        try {
            const response = await fetch("http://localhost:8000/api/v1/templates/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: recipientEmail,
                    emailId
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert("✅ Email sent!");
            } else {
                alert(`❌ Failed: ${result.message}`);
            }
        } catch (error) {
            console.error("❌ Error sending email:", error);
            alert("❌ Could not send email.");
        }
    };

    return (
        <Container className="mt-4 ">
            <h2>Email Template Builder</h2>
            <Form.Group className="mb-3 mt-3" controlId="templateTitle">
                <Form.Label>Template Title</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter title for this template"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </Form.Group>
            <p><strong>Editing Template:</strong> {title || "Untitled"}</p>
            <EmailEditor ref={emailEditorRef} onLoad={onEditorReady} />
            <div className="mt-3">
                <Button variant="primary" onClick={exportDesign} className="me-2">
                    Export Template
                </Button>
                <Button variant="success" onClick={saveTemplate}>
                    Save Template
                </Button>
                <input
                    type="email"
                    placeholder="Recipient Email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="form-control mt-3"
                />
                <Button variant="warning" onClick={sendEmail} className="mt-2">
                    Send Email
                </Button>
            </div>
        </Container>
    );
};

export default CustomEmailEditor;
