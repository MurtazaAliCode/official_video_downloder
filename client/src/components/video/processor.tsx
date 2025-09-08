import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const processingSchema = z.object({
  action: z.enum(['compress', 'convert', 'trim', 'extract', 'watermark']),
  // Compression options
  compressionQuality: z.enum(['high', 'medium', 'low']).optional(),
  // Conversion options
  outputFormat: z.enum(['mp4', 'avi', 'mov', 'gif']).optional(),
  // Trim options
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Format: HH:MM:SS").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Format: HH:MM:SS").optional(),
  // Extract options
  audioFormat: z.enum(['mp3', 'wav']).optional(),
  // Watermark options
  watermarkText: z.string().optional(),
  watermarkPosition: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
});

type ProcessingFormData = z.infer<typeof processingSchema>;

interface VideoProcessorProps {
  onProcess: (data: ProcessingFormData) => void;
  isProcessing?: boolean;
}

export function VideoProcessor({ onProcess, isProcessing = false }: VideoProcessorProps) {
  const [selectedAction, setSelectedAction] = useState<string>('compress');

  const form = useForm<ProcessingFormData>({
    resolver: zodResolver(processingSchema),
    defaultValues: {
      action: 'compress',
      compressionQuality: 'medium',
      outputFormat: 'mp4',
      audioFormat: 'mp3',
      watermarkPosition: 'bottom-right',
    },
  });

  const handleSubmit = (data: ProcessingFormData) => {
    onProcess(data);
  };

  const renderActionOptions = () => {
    switch (selectedAction) {
      case 'compress':
        return (
          <FormField
            control={form.control}
            name="compressionQuality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compression Quality</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  data-testid="compression-quality-select"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High Quality (Larger file)</SelectItem>
                    <SelectItem value="medium">Medium Quality (Balanced)</SelectItem>
                    <SelectItem value="low">Low Quality (Smaller file)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        );

      case 'convert':
        return (
          <FormField
            control={form.control}
            name="outputFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Format</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  data-testid="output-format-select"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="gif">GIF (Short clips only)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        );

      case 'trim':
        return (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time (HH:MM:SS)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00:00:00" 
                      {...field} 
                      data-testid="start-time-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time (HH:MM:SS)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00:05:00" 
                      {...field} 
                      data-testid="end-time-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      case 'extract':
        return (
          <FormField
            control={form.control}
            name="audioFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio Format</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  data-testid="audio-format-select"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
                    <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        );

      case 'watermark':
        return (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="watermarkText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Watermark Text</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your watermark text" 
                      {...field} 
                      data-testid="watermark-text-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="watermarkPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    data-testid="watermark-position-select"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Options</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Action Selection */}
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Action</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedAction(value);
                    }}
                    defaultValue={field.value}
                    data-testid="action-select"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="compress">Compress Video (Reduce file size)</SelectItem>
                      <SelectItem value="convert">Convert Format</SelectItem>
                      <SelectItem value="trim">Trim Video</SelectItem>
                      <SelectItem value="extract">Extract Audio</SelectItem>
                      <SelectItem value="watermark">Add Watermark</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Dynamic Options */}
            {renderActionOptions()}

            {/* Process Button */}
            <Button
              type="submit"
              className="w-full btn-gradient text-primary-foreground py-4 text-lg font-semibold hover:scale-[1.02] transition-all"
              disabled={isProcessing}
              data-testid="process-button"
            >
              {isProcessing ? "Processing..." : "Start Processing"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
