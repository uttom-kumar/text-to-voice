import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Box,
    Stack,
    MenuItem,
} from "@mui/material";

const TextToSpeechApp = () => {
    const [text, setText] = useState("");
    const [currentLine, setCurrentLine] = useState(-1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [lines, setLines] = useState([]);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState("");

    const synthRef = useRef(window.speechSynthesis);
    const currentIndexRef = useRef(0);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            const banglaVoice = availableVoices.find((v) => v.lang.startsWith("bn"));
            if (banglaVoice) {
                setSelectedVoice(banglaVoice.name);
            } else if (availableVoices.length > 0) {
                setSelectedVoice(availableVoices[0].name);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            synthRef.current.cancel();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const speakLine = (index, linesArray = lines) => {
        if (index >= linesArray.length) {
            setCurrentLine(-1);
            setIsSpeaking(false);
            setIsPaused(false);
            return;
        }

        setCurrentLine(index);
        currentIndexRef.current = index;
        const utterance = new SpeechSynthesisUtterance(linesArray[index]);

        const voice = voices.find((v) => v.name === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onend = () => {
            if (!isPaused) {
                speakLine(index + 1, linesArray);
            }
        };
        utterance.onerror = () => {
            console.error("Speech synthesis error");
            setIsSpeaking(false);
            setIsPaused(false);
        };

        synthRef.current.speak(utterance);
    };

    const handleSpeak = () => {
        if (text.trim() === "") {
            alert("Please enter some text!");
            return;
        }

        synthRef.current.cancel();
        const splitLines = text.split("\n").filter((line) => line.trim() !== "");
        setLines(splitLines);
        setIsSpeaking(true);
        setIsPaused(false);
        speakLine(0, splitLines);
    };

    const handlePauseResume = () => {
        if (synthRef.current.speaking && !isPaused) {
            synthRef.current.pause();
            setIsPaused(true);
        } else if (isPaused) {
            synthRef.current.resume();
            setIsPaused(false);
        }
    };

    const handleStop = () => {
        synthRef.current.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentLine(-1);
        currentIndexRef.current = 0;
    };

    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    const handleVoiceChange = (e) => {
        setSelectedVoice(e.target.value);
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            sx={{
                background: "linear-gradient(135deg, #d8b4fe, #cbd5e1)",
                px: { xs: 2, md: 0 },
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 700,
                    p: 4,
                    borderRadius: 6,
                    boxShadow: 6,
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <CardContent>
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{
                            color: "purple",
                            fontWeight: 700,
                            mb: 3,
                            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                        }}
                    >
                        Text to Speech 🇧🇩
                    </Typography>

                    <TextField
                        multiline
                        minRows={5}
                        placeholder="Enter text here (use line breaks)"
                        value={text}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                        sx={{
                            mb: 3,
                            backgroundColor: "white",
                            borderRadius: 2,
                        }}
                    />

                    <TextField
                        select
                        label="Select Voice"
                        value={selectedVoice}
                        onChange={handleVoiceChange}
                        fullWidth
                        sx={{
                            mb: 3,
                            backgroundColor: "white",
                            borderRadius: 2,
                        }}
                    >
                        {voices.map((voice, index) => (
                            <MenuItem key={index} value={voice.name}>
                                {voice.name} ({voice.lang})
                                {voice.lang.startsWith("bn") && " 🇧🇩"}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleSpeak}
                            disabled={isSpeaking && !isPaused}
                            fullWidth
                            sx={{ py: 1.5, fontWeight: 600, borderRadius: 3 }}
                        >
                            Speak
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handlePauseResume}
                            disabled={!isSpeaking}
                            fullWidth
                            sx={{ py: 1.5, fontWeight: 600, borderRadius: 3 }}
                        >
                            {isPaused ? "Resume" : "Pause"}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleStop}
                            disabled={!isSpeaking}
                            fullWidth
                            sx={{ py: 1.5, fontWeight: 600, borderRadius: 3 }}
                        >
                            Stop
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TextToSpeechApp;
