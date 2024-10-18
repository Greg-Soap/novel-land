import { useParams } from "react-router-dom";
import { ReactReader } from "react-reader";
import Layout from "@/layout/layout";
import { useTheme } from "@/components/theme-provider";
import { Loading } from "./novel-reader-components/loader";
import ControlPanel from "@/components/novel-reader-components/control-panel";
import Navigation from "@/components/novel-reader-components/navigation";
import { useNovelReader } from "./novel-reader-components/use-novel-reader";
import { useTts } from "tts-react";
import { useEffect, useState, useCallback } from "react";

export default function NovelReader() {
  const { filename } = useParams();
  const { theme } = useTheme();
  const {
    location,
    toc,
    currentChapter,
    isMenuExpanded,
    isLoading,
    isSpeaking,
    fontSize,
    readerStyles,
    handleLocationChanged,
    handleTocChange,
    handleChapterChange,
    toggleMenu,
    handlePageChange,
    handleFontSizeChange,
    setRendition,
    customRendition,
  } = useNovelReader(filename);

  const getTextContent = () => {
    if (!customRendition) return "";
    const contents = customRendition.getContents();
    // @ts-expect-error ignore
    if (!contents || contents.length === 0) return "";
    // @ts-expect-error ignore
    const content = contents[0];
    return content.documentElement?.textContent || "";
  };

  const text = getTextContent();

  let voices: SpeechSynthesisVoice[] = [];

  if (window.speechSynthesis) {
    voices = window.speechSynthesis.getVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
      };
    }
  }
  const toLocales = (voices: SpeechSynthesisVoice[]) =>
    Array.from(new Set(voices.map((voice) => voice.lang)));
  const [locales, setLocales] = useState(() =>
    toLocales(window.speechSynthesis.getVoices() ?? [])
  );
  const [lang, setLang] = useState<string | undefined>();
  const [rate, setRate] = useState(1);
  //   const [ setPitch] = useState(1);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | undefined>();

  useEffect(() => {
    if (!voices.length) {
      voices = window.speechSynthesis.getVoices();
      setLocales(toLocales(voices));
    }
  }, []);

  const {
    state,
    play,
    stop,
    pause,
    playOrPause,
    // set: { pitch },
  } = useTts({
    children: text || "",
    markTextAsSpoken: true,
    markBackgroundColor: "#55AD66",
    markColor: "white",
    lang,
    voice,
    rate,
    // onPitchChange: (newPitch: number) => {
    //   setPitch(newPitch);
    // },
    onRateChange: (newRate: number) => {
      setRate(newRate);
    },
  });

  //   const handlePitchChange = useCallback((newPitch: number) => {
  //     setPitch(newPitch);
  //   }, []);

  const handleRateChange = useCallback((newRate: number) => {
    setRate(newRate);
  }, []);

  const handleLangChange = useCallback((newLang: string) => {
    setLang(newLang);
    setVoice(undefined); // Reset voice when language changes
  }, []);

  const handleVoiceChange = useCallback((newVoice: SpeechSynthesisVoice) => {
    setVoice(newVoice);
    setLang(newVoice.lang); // Update language to match the selected voice
  }, []);

  const handleToggleTTS = useCallback(() => {
    playOrPause();
  }, [playOrPause]);

  return (
    <Layout noFooter>
      {isLoading && <Loading />}
      <div className={`flex flex-col ${theme}`}>
        <div className="flex-grow md:container md:mx-auto max-w-7xl sm:px-6 lg:px-8 pt-8 pb-16 h-[calc(100vh - 60px)] ">
          <ReactReader
            url={`/novels/${filename}`}
            location={location}
            locationChanged={handleLocationChanged}
            loadingView={<Loading />}
            styles={readerStyles}
            tocChanged={handleTocChange}
            showToc={false}
            epubInitOptions={{
              openAs: "epub",
            }}
            epubOptions={{
              flow: "scrolled-doc",
              resizeOnOrientationChange: true,
              allowPopups: true,
            }}
            // @ts-expect-error ignore
            readerStyles={{
              next: { display: "none" },
              prev: { display: "none" },
            }}
            getRendition={setRendition}
          />
          <Navigation handlePageChange={handlePageChange} />

          <ControlPanel
            isMenuExpanded={isMenuExpanded}
            toc={toc}
            currentChapter={currentChapter}
            onChapterChange={handleChapterChange}
            onToggleMenu={toggleMenu}
            onToggleTTS={handleToggleTTS}
            isSpeaking={isSpeaking}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            ttsState={state}
            ttsPlay={play}
            ttsPause={pause}
            ttsStop={stop}
            // onPitchChange={handlePitchChange}
            onRateChange={handleRateChange}
            onLangChange={handleLangChange}
            onVoiceChange={handleVoiceChange}
            // pitch={pitch}
            rate={rate}
            lang={lang}
            voice={voice}
            voices={voices}
            locales={locales}
          />
        </div>
      </div>
    </Layout>
  );
}
