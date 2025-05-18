<FormControlLabel
        control={
          <Switch
            checked={formData.isRelative}
            onChange={e =>
              setFormData(prev => ({ ...prev, isRelative: e.target.checked }))
            }
          />
        }
        label="Relative Size"
      />

      {formData.isRelative && (
        <>
          <TextField
            fullWidth
            label="Relative To Room"
            value={formData.relativeTo}
            onChange={e =>
              setFormData(prev => ({ ...prev, relativeTo: e.target.value }))
            }
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Relative Ratio"
            type="number"
            value={formData.relativeRatio}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                relativeRatio: Number(e.target.value),
              }))
            }
            margin="normal"
            required
          />
        </>
      )}