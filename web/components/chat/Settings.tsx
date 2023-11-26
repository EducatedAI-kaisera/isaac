import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import { Slider } from '@components/ui/slider';
import { Toggle } from '@components/ui/toggle';
import useChatStore from '@context/chat.store';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { FaSlidersH, FaTimes } from 'react-icons/fa';
import { ChatContext } from 'types/chat';

// Types
interface SettingsProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Animations
const settingsModalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: -5,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
};

const Settings = ({
  isSettingsOpen,
  setIsSettingsOpen,
  setIsSearchOpen,
}: SettingsProps) => {
  const chatContext = useChatStore(s => s.chatContext);
  const setChatContext = useChatStore(s => s.setChatContext);
  const temperature = useChatStore(s => s.temperature);
  const setTemperature = useChatStore(s => s.setTemperature);
  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center pt-16 bg-white/70 backdrop-blur-sm dark:bg-neutral-900/70"
          variants={settingsModalVariants}
          animate={isSettingsOpen ? 'visible' : 'hidden'}
          exit="hidden"
          initial="hidden"
        >
          {/* Exit Overlay */}
          <div
            className="absolute inset-0 z-0"
            onClick={() => {
              setIsSettingsOpen(false);
            }}
          />
          {/* Modal Inner Container */}
          <div className="z-20 w-full max-w-lg rounded-md shadow-md dark:bg-neutral-950/90 bg-white/90">
            {/* Header */}
            <div className="flex items-center justify-between py-2 pl-6 pr-2 border-b dark:border-neutral-800 border-neutral-200">
              <h2 className="font-medium">Chat Settings</h2>
              <Toggle
                variant="ghost"
                size="sm"
                pressed={false}
                onClick={() => {
                  setIsSettingsOpen(prev => !prev);
                  setIsSearchOpen(false);
                }}
              >
                {!isSettingsOpen ? (
                  <FaSlidersH className="text-gray-500" />
                ) : (
                  <FaTimes className="text-gray-500" />
                )}
              </Toggle>
            </div>
            {/* Form Container */}
            <div className="px-6 py-6 space-y-6">
              {/* Context Radio Group */}
              <div className="space-y-4">
                <div>
                  <div className="font-medium">Context</div>
                  <div className="text-xs text-neutral-500">
                    Choose the context of the conversation.
                  </div>
                </div>
                <RadioGroup
                  onValueChange={value => {
                    setChatContext(value as ChatContext);
                  }}
                  defaultValue={chatContext}
                  className="space-y-4"
                >
                  <Label
                    htmlFor="project"
                    className=" rounded-md bg-neutral-50 dark:bg-neutral-900 p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:border"
                  >
                    <RadioGroupItem
                      value="project"
                      id="project"
                      className="sr-only"
                    />
                    <div className="font-bold">Isaac</div>
                    <div className="text-xs">
                      Included: Isaac&apos;s base model & infinite chat history
                    </div>
                  </Label>
                  <Label
                    htmlFor="references"
                    className=" rounded-md bg-neutral-50 dark:bg-neutral-900 p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:border"
                  >
                    <RadioGroupItem
                      value="references"
                      id="references"
                      className="sr-only"
                    />
                    <div className="font-bold">References</div>
                    <div className="text-xs">
                      Included: All your uploaded papers & documents. Or just a
                      single file.
                    </div>
                  </Label>
                  {/* TODO: Enable chatting with a single file */}
                  {/* <Label
                    htmlFor="file"
                    className=" rounded-md  bg-neutral-50 dark:bg-neutral-900 p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:border"
                  >
                    <RadioGroupItem
                      value="file"
                      id="file"
                      className="sr-only"
                    />
                    <div className="font-bold">Single File</div>
                    <div className="text-xs">
                      Chat with a single PDF file from your references
                    </div>
                  </Label> */}
                  <Label
                    htmlFor="realtime"
                    className=" rounded-md  bg-neutral-50 dark:bg-neutral-900 p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:border"
                  >
                    <RadioGroupItem
                      value="realtime"
                      id="realtime"
                      className="sr-only"
                    />
                    <div className="font-bold">Realtime Data</div>
                    <div className="text-xs">
                      Included: Realtime data sourced from the web
                    </div>
                  </Label>
                </RadioGroup>
              </div>
              {/* Creativity Settings */}
              <div className="space-y-4">
                <div>
                  <div className="font-medium">Creativity</div>
                  <div className="text-xs text-neutral-500">
                    Lower creativity means generating answers based on the
                    context strictly.
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm text-neutral-500">
                    <div>0</div>
                    <div>100</div>
                  </div>
                  <Slider
                    className="bg-transparent"
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={[temperature]}
                    onValueChange={value => {
                      setTemperature(value[0]);
                    }}
                    id="creativity"
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => {
                    setIsSettingsOpen(false);
                  }}
                >
                  Save Settings
                </Button>
                <Button
                  onClick={() => {
                    setChatContext('project');
                    setTemperature(0.78);
                    setIsSettingsOpen(false);
                  }}
                  variant="outline"
                >
                  Reset to Default
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Settings;
