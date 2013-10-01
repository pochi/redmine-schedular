class CreateSchedularCustomListContents < ActiveRecord::Migration
  def change
    create_table :scheduler_custom_list_contents do |t|
      t.integer :scheduler_custom_list_id
      t.string :name
    end
  end
end
