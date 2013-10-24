class CreateSchedularCustomLists < ActiveRecord::Migration
  def change
    create_table :scheduler_custom_lists do |t|
      t.integer :scheduler_setting_id
      t.string :title, :default => "チーム名"
    end

    SchedulerCustomList.create(:scheduler_setting_id => SchedulerSetting.first.id)
  end
end
